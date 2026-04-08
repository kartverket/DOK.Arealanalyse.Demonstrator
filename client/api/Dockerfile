FROM python:3.13-slim-trixie

ENV VIRTUAL_ENV=/app/.venv
ENV PATH="$VIRTUAL_ENV/bin:/root/.local/bin/:$PATH"

WORKDIR /app
COPY . .

ARG DEB_BUILD_DEPS="\
    build-essential \
    libgdal-dev \
    curl"

ARG DEB_PACKAGES="\
    gdal-bin" 

RUN apt -y update \
    && apt -y --no-install-recommends install ${DEB_BUILD_DEPS} \
    && apt -y --no-install-recommends install ${DEB_PACKAGES} \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && uv venv $VIRTUAL_ENV \
    && . activate \
    && uv sync --frozen \
    && uv add gdal[numpy]==$(gdal-config --version) \
    && apt -y purge ${DEB_BUILD_DEPS} \
    && apt -y autoremove

EXPOSE 5001

CMD ["uv", "run", "./main.py"]
