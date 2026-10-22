"""Точка входа контейнера: API + раздача SPA.

HTTPS терминирует ваш существующий веб-сервер/прокси на порту 8080
(сертификат — у него). Поэтому приложение всегда слушает HTTP на :8000,
доверяет X-Forwarded-* от прокси и корректно видит https в cookie-сессии
(админка заходит и по HTTPS).
"""

import logging
import os

import uvicorn

from main import app as fastapi_app

log = logging.getLogger("forma")


def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    log.info("HTTP на :8000 (за прокси). TLS/80/443 — на стороне хоста.")
    uvicorn.run(
        fastapi_app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "8000")),
        proxy_headers=True,
        forwarded_allow_ips=os.environ.get("FORMA_FORWARDED_IPS", "*"),
        server_header=False,
    )


if __name__ == "__main__":
    main()
