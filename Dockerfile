# --- build the SPA -----------------------------------------------------------
FROM node:20-alpine AS web

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- runtime: one process serves API + static (+ TLS from /certs) ------------
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FORMA_DB=/data/forma.db

WORKDIR /app

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/*.py ./
COPY --from=web /app/dist ./frontend/dist

RUN mkdir -p /data /certs
VOLUME ["/data"]

EXPOSE 8000 8443
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/forms').read()" || exit 1

CMD ["python", "entrypoint.py"]
