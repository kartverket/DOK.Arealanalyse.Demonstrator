FROM python:3.13-alpine3.23

ENV VIRTUAL_ENV=/app/.venv
ENV PATH="$VIRTUAL_ENV/bin:/root/.local/bin/:$PATH"

WORKDIR /app
COPY main.py pyproject.toml uv.lock ./

RUN apk add --update-cache curl \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && uv python install 3.13 \
    && uv venv $VIRTUAL_ENV \
    && . activate \
    && uv sync --frozen

EXPOSE 5004

CMD ["uv", "run", "./main.py"]
