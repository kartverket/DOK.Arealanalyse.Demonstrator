# Arealanalyse av DOK-datasett
Demonstrator for oppsett av arealanalyse basert på pygeoapi

## Forutsetninger for installasjon i eget miljø
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

Disse verktøyene er nødvendige for å bygge og kjøre applikasjonen i et containerisert miljø.


## Komponenter i løsningen
![Arkitektur](komponenter.jpg)

## Last ned demonstratorprosjektet
Start med å laste ned demonstratorprosjektet som inneholder front-end, socket-io, web-api og binary-creator.

```bash
git clone https://github.com/kartverket/DOK.Arealanalyse.Demonstrator.git
cd DOK.Arealanalyse.Demonstrator
```

## Last ned konfigurasjonsfiler
Last ned konfigurasjonsfiler for analyseoppsett mot datasettene i DOK.

```bash
git clone https://github.com/kartverket/DOK.Arealanalyse.Config.git
cd DOK.Arealanalyse.Config
```

### Justere konfigurasjonen til ditt miljø
juster miljøvariabler i prosjektet

```ini
PYGEOAPI_API_URL=http://localhost:5000
APP_FILES_DIR=/mnt/dokanalyse
SOCKET_IO_SRV_URL=http://localhost:5002/
```
### Kjøre applikasjonene i docker 
```bash
docker-compose up --build
```
## Last ned pygeoapi med plugin for DOK arealanalyse
Må bruke branch 0.19.1 som passer sammen med process-plugin for DOK arealanalyse

```bash
git clone --branch 0.19.1 https://github.com/kartverket/DOK.Arealanalyse.Pygeoapi.git
cd DOK.Arealanalyse.Pygeoapi
```
### Justere konfigurasjonen til ditt miljø
juster miljøvariabler i prosjektet

```ini
PYGEOAPI_CONFIG=/pygeoapi/local.config.yml
PYGEOAPI_API_URL=http://localhost:5000/
APP_FILES_DIR=/mnt/dokanalyse
DOKANALYSE_CONFIG_DIR=/mnt/dokanalyse/config
AR5_FGDB_PATH=
BLOB_STORAGE_CONN_STR=
MAP_IMAGE_API_URL=http://host.docker.internal:5003/binary/create/map-image
SOCKET_IO_SRV_URL=http://host.docker.internal:5002/
```
### Kjøre applikasjonene i docker 
```bash
docker-compose up --build
```



## Markedsplass
Beskrivelse av tjenesten som er ihht GaiaX for evt publisering av tjenesten i dataspace/markedsplass

[![Gaia-X Compliant](https://img.shields.io/badge/Gaia--X-Compliant-blue)](./gaia-x/self-description.json)
