FROM python:3.13-alpine3.23

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Avhengighetene installeres før koden kopieres inn, slik at laget gjenbrukes når bare koden endres
COPY pyproject.toml uv.lock ./

RUN apk add --no-cache --virtual .build-deps curl \
    && curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR=/tmp/uv UV_NO_MODIFY_PATH=1 sh \
    && /tmp/uv/uv sync --frozen --no-dev \
    && rm -rf /tmp/uv /root/.cache \
    && apk del .build-deps \
    && adduser -D -H app

COPY main.py ./

USER app

EXPOSE 5002

CMD ["python", "main.py"]
