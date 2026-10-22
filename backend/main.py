import io, json, os
import sqlite3
import secrets
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Annotated, Any

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.middleware.sessions import SessionMiddleware

DB_PATH = os.environ.get("FORMA_DB", os.path.join(os.path.dirname(__file__), "forma.db"))
# Repo layout: backend/ + frontend/dist. Docker layout: /app/frontend/dist.
_CANDIDATES = (
    os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"),
    os.path.join(os.path.dirname(__file__), "frontend", "dist"),
)
STATIC_DIR = os.environ.get("FORMA_STATIC_DIR") or next((d for d in _CANDIDATES if os.path.isdir(d)), _CANDIDATES[0])
ADMIN_USER = os.environ.get("FORMA_ADMIN_USER", "admin")
ADMIN_PASSWORD = os.environ.get("FORMA_ADMIN_PASSWORD", "admin123")

from forms import FORMS, form_by_path  # noqa: E402


def form_by_slug(slug: str):
    for form in FORMS:
        if form["slug"] == slug:
            return form
    raise HTTPException(status_code=404, detail="Форма не найдена")


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def tx():
    conn = db()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


with tx() as conn:
    conn.execute(
        """CREATE TABLE IF NOT EXISTS submissions (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            ip TEXT,
            payload TEXT NOT NULL
        )"""
    )
    # ponytail: additive migration for the multi-form registry; old rows
    # belong to the only form that existed then.
    cols = {r[1] for r in conn.execute("PRAGMA table_info(submissions)")}
    if "form_id" not in cols:
        conn.execute("ALTER TABLE submissions ADD COLUMN form_id TEXT NOT NULL DEFAULT 'ped-sostav'")

app = FastAPI(title="Форма", docs_url=None, redoc_url=None)
# ponytail: one admin, one process — a signed cookie is enough.
app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ.get("FORMA_SECRET", secrets.token_hex(32)),
    same_site="lax",
    session_cookie="forma_session",
)


class Login(BaseModel):
    username: str
    password: str


class Submission(BaseModel):
    # ponytail: values are strings except specialties (list or comma string)
    data: dict[str, Any] = Field(default_factory=dict)


def require_admin(request: Request):
    if not request.session.get("admin"):
        raise HTTPException(status_code=401, detail="Требуется вход")
    return True


@app.get("/api/forms")
def forms():
    return [{"slug": f["slug"], "path": f["path"], "title": f["title"]} for f in FORMS]


@app.get("/api/forms/{slug}")
def form_detail(slug: str):
    form = form_by_slug(slug)
    return {"slug": form["slug"], "path": form["path"], "title": form["title"], "fields": form["fields"]}


@app.post("/api/forms/{slug}/submissions", status_code=201)
def submit(slug: str, body: Submission, request: Request):
    form = form_by_slug(slug)
    data = {}
    for f in form["fields"]:
        if f["type"] == "specialties":
            raw = body.data.get(f["key"]) or []
            if isinstance(raw, str):
                raw = raw.split(",")
            allowed = f["options"]
            value = ", ".join(v for v in (str(x).strip() for x in raw) if v in allowed)
        else:
            value = str(body.data.get(f["key"], "")).strip()
        if f.get("required") and not value:
            raise HTTPException(status_code=422, detail=f"Заполните поле «{f['label']}»")
        data[f["key"]] = value[:5000]
    sid = secrets.token_urlsafe(6)
    created = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with tx() as conn:
        conn.execute(
            "INSERT INTO submissions (id, form_id, created_at, ip, payload) VALUES (?, ?, ?, ?, ?)",
            (sid, slug, created, request.client.host if request.client else None, json.dumps(data, ensure_ascii=False)),
        )
    return {"id": sid, "created_at": created}


@app.post("/api/admin/login")
def login(body: Login, request: Request):
    # ponytail: plain compare, swap to a hash if this ever leaves localhost.
    if secrets.compare_digest(body.username, ADMIN_USER) and secrets.compare_digest(body.password, ADMIN_PASSWORD):
        request.session["admin"] = True
        return {"ok": True}
    raise HTTPException(status_code=401, detail="Неверный логин или пароль")


@app.post("/api/admin/logout")
def logout(request: Request):
    request.session.clear()
    return {"ok": True}


@app.get("/api/admin/me")
def me(admin: Annotated[bool, Depends(require_admin)]):
    return {"username": ADMIN_USER}


@app.get("/api/admin/submissions")
def list_submissions(admin: Annotated[bool, Depends(require_admin)]):
    with tx() as conn:
        rows = conn.execute("SELECT * FROM submissions ORDER BY created_at DESC").fetchall()
    forms = {f["slug"]: f for f in FORMS}
    out = []
    for r in rows:
        form = forms.get(r["form_id"]) or FORMS[0]
        out.append(
            {
                **dict(r),
                "payload": json.loads(r["payload"]),
                "fields": form["fields"],
                "form_title": form["title"],
            }
        )
    return out


@app.get("/api/admin/submissions.csv")
def export_csv(admin: Annotated[bool, Depends(require_admin)]):
    import csv

    fields = FORMS[0]["fields"]  # ponytail: flat export over the first form's columns
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["ID", "Форма", "Отправлено (UTC)", "IP"] + [f["label"] for f in fields])
    forms = {f["slug"]: f for f in FORMS}
    with tx() as conn:
        for r in conn.execute("SELECT * FROM submissions ORDER BY created_at DESC"):
            p = json.loads(r["payload"])
            title = (forms.get(r["form_id"]) or FORMS[0])["title"]
            w.writerow([r["id"], title, r["created_at"], r["ip"] or ""] + [p.get(f["key"], "") for f in fields])
    return Response(
        buf.getvalue().encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="forma.csv"'},
    )


if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/healthz", include_in_schema=False)
    def healthz():
        return {"ok": True}

    @app.get("/", include_in_schema=False)
    def home():
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

    @app.get("/{path:path}", include_in_schema=False)
    def spa(path: str):
        if path.lower() in {f["path"] for f in FORMS}:
            return FileResponse(os.path.join(STATIC_DIR, "index.html"))
        file = os.path.join(STATIC_DIR, path)
        if path and os.path.isfile(file) and os.path.abspath(file).startswith(os.path.abspath(STATIC_DIR)):
            return FileResponse(file)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
