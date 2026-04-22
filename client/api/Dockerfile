FROM python:3.13-slim-trixie

ENV LANG=nb_NO.UTF-8
ENV LC_ALL=nb_NO.UTF-8
ENV VIRTUAL_ENV=/app/.venv
ENV PATH="$VIRTUAL_ENV/bin:/root/.local/bin/:$PATH"

WORKDIR /app
COPY . .

ARG DEB_BUILD_DEPS="\
    build-essential \
    libgdal-dev \
    curl"

ARG DEB_PACKAGES="\
    locales \
    gdal-bin" 

RUN apt -y update \
    && apt -y --no-install-recommends install ${DEB_BUILD_DEPS} \
    && apt -y --no-install-recommends install ${DEB_PACKAGES} \
    && sed -i -e 's/# nb_NO.UTF-8 UTF-8/nb_NO.UTF-8 UTF-8/' /etc/locale.gen \
    && locale-gen \
    && curl -LsSf https://astral.sh/uv/install.sh | sh \
    && uv venv $VIRTUAL_ENV \
    && . activate \
    && uv sync --frozen \
    && uv add gdal[numpy]==$(gdal-config --version) \
    && uv pip install -e . \
    && apt -y purge ${DEB_BUILD_DEPS} \
    && apt -y autoremove

EXPOSE 5001

CMD ["uv", "run", "-m", "dokanalyse-web-api.main"]
