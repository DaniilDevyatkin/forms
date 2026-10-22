# Форма

Главная со списком форм → форма → SQLite → админка с полными ответами.

**Стек:** React 19 + Vite + Tailwind 3 · FastAPI + SQLite · Docker (сайт на хосте `:8080`, HTTPS — на вашем прокси).

## Развёртывание на VPS

Нужно: VPS с Docker + Docker Compose, домен с A-записью на IP сервера и веб-сервер/прокси на хосте, который отдаёт `skoiptforma.ru` по HTTPS и проксирует на `127.0.0.1:8080` (сертификат — на нём же).

```bash
git clone <repo> forma && cd forma
cp .env.example .env
# отредактируйте .env: FORMA_ADMIN_PASSWORD, FORMA_SECRET
docker compose up -d --build
```

Сайт: `http://IP:8080` → главная, `/pedsostav` — «Форма Пед.Состав», `/admin` — админка (кнопка в шапке на любой странице).

Проверка: `curl -s http://127.0.0.1:8080/api/forms` должен вернуть JSON со списком форм.

### Прокси домена (пример nginx на хосте)

```nginx
server {
    listen 443 ssl;
    server_name skoiptforma.ru;
    ssl_certificate     /etc/letsencrypt/live/skoiptforma.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/skoiptforma.ru/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name skoiptforma.ru;
    return 301 https://$host$request_uri;
}
```

Если прокси слушает `8080` сам, смените порт контейнера в `docker-compose.yml` (`"8081:8000"` и т. п.).

### DNS

| Тип | Имя | Значение |
|---|---|---|
| A | `@` | IP вашего VPS |

Обновление приложения: `git pull && docker compose up -d --build` — база в томе `forma-data` (`/data/forma.db`) сохраняется.

### Локальная проверка в Docker

```bash
docker build -t forma .
docker run --rm -p 8080:8000 -e FORMA_ADMIN_PASSWORD=admin123 -e FORMA_SECRET=dev forma
# http://localhost:8080
```

## Локальная разработка (без Docker)

```powershell
cd backend; python -m uvicorn main:app --reload --port 8000   # API + собранный SPA
cd frontend; npm install; npm run dev                         # Vite :5173 с прокси /api
```

Админ по умолчанию: **admin / admin123**. Меняется через `.env` (`FORMA_ADMIN_USER`, `FORMA_ADMIN_PASSWORD`). `FORMA_SECRET` обязательно замените на длинную случайную строку: `openssl rand -hex 32`.

## Формы

Реестр форм — `backend/forms.py: FORMS`. Запись = `slug` (внутренний ключ, он же `form_id` в базе), `path` (URL после домена, например `pedsostav` → `/pedsostav`), `title`, `fields`.

Поля текущей формы — `backend/fields.py`: `FIELDS` (15 пунктов) и `SPECIALTIES` — справочник профессий. Типы: `text`, `textarea`, `list`, `specialties` (мультивыбор). Все пункты обязательные.

Ответы хранятся JSON-ом с колонкой `form_id`; специальности — строкой через запятую.

## API

| Метод | Путь | Доступ |
|---|---|---|
| GET | `/api/forms` | публично |
| GET | `/api/forms/{slug}` | публично |
| POST | `/api/forms/{slug}/submissions` | публично |
| POST | `/api/admin/login` / `logout` | — |
| GET | `/api/admin/submissions` | админ |
| GET | `/api/admin/submissions.csv` | админ |

## Проверка

```powershell
cd frontend; npm run lint; npm run build
cd backend; python test_api.py
```
