from fastapi.testclient import TestClient
import os, tempfile

os.environ["FORMA_DB"] = os.path.join(tempfile.mkdtemp(), "t.db")
import main

c = TestClient(main.app)
admin = TestClient(main.app)

forms = c.get("/api/forms").json()
assert forms == [{"slug": "ped-sostav", "path": "pedsostav", "title": "Форма Пед.Состав"}], forms
assert main.form_by_path("/pedsostav")["slug"] == "ped-sostav"
assert c.get("/api/forms/nope").status_code == 404

fields = c.get("/api/forms/ped-sostav").json()["fields"]
assert len(fields) == 15, len(fields)
assert fields[4]["type"] == "specialties" and len(fields[4]["options"]) == 13
assert all(f["required"] for f in fields)

assert c.get("/api/admin/submissions").status_code == 401

r = c.post("/api/forms/ped-sostav/submissions", json={"data": {"position": "Преподаватель"}})
assert r.status_code == 422, r.text
r = c.post("/api/forms/ped-sostav/submissions", json={"data": {f["key"]: "x" for f in fields if f["type"] != "specialties"}})
assert r.status_code == 422, r.text
assert c.post("/api/forms/nope/submissions", json={"data": {}}).status_code == 404

r = c.post(
    "/api/forms/ped-sostav/submissions",
    json={
        "data": {
            "full_name": "Тестов Тест",
            "position": "Преподаватель",
            "education_level": "Высшее",
            "training_area": "ИВТ",
            "specialties": ["09.02.07 Информационные системы и программирование", "16909 Портной", "мусор"],
            "subjects": "Математика, информатика",
            "position_experience": "5 лет",
            "category": "Первая",
            "total_experience": "12 лет",
            "teaching_experience": "10 лет",
            "training": "Курс А",
            "retraining": "Программа В",
            "degrees": "Кандидат педагогических наук",
            "titles": "Доцент",
            "internship": "Стажировка Г",
        }
    },
)
assert r.status_code == 201, r.text
sid = r.json()["id"]

assert admin.post("/api/admin/login", json={"username": "admin", "password": "nope"}).status_code == 401
assert admin.post("/api/admin/login", json={"username": "admin", "password": "admin123"}).status_code == 200
rows = admin.get("/api/admin/submissions").json()
assert len(rows) == 1 and rows[0]["id"] == sid and rows[0]["form_id"] == "ped-sostav"
assert rows[0]["form_title"] == "Форма Пед.Состав"
p = rows[0]["payload"]
assert p["specialties"] == "09.02.07 Информационные системы и программирование, 16909 Портной", p["specialties"]
csv = admin.get("/api/admin/submissions.csv")
assert csv.status_code == 200 and sid in csv.text and "Занимаемая должность" in csv.text and "Пед.Состав" in csv.text
admin.post("/api/admin/logout")
assert admin.get("/api/admin/submissions").status_code == 401
print("all checks passed")
