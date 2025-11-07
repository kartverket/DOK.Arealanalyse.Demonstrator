FROM debian:trixie-slim AS build

ENV VIRTUAL_ENV=/app/.venv
ENV PATH="$VIRTUAL_ENV/bin:/root/.local/bin/:$PATH"

WORKDIR /app
COPY main.py pyproject.toml uv.lock ./

RUN apt -y update \
    && apt -y install curl binutils \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && uv python install 3.13 \
    && uv venv $VIRTUAL_ENV \
    && . activate \
    && uv sync \
    && pyinstaller --name main --onefile --hidden-import=main ./main.py


FROM debian:trixie-slim

WORKDIR /app
COPY --from=build /app/dist /app

EXPOSE 5002

CMD ["./main"]
