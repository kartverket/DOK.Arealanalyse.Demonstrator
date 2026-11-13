import locale
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import uvicorn
import aiohttp
from .routers import (dok_tema, eiendom, eksempler,
                      kommuner, omrade, pygeoapi, plan, sok, status)
from .routers.pygeoapi import JOB_ID_HEADER
from .services.kommuner import get_kommuner
from .services.healthcheck.scheduler import start_scheduler
from .utils import session_registry
from .utils.helpers import is_development

locale.setlocale(locale.LC_COLLATE, 'nb_NO.UTF-8')
logging.basicConfig(level=logging.INFO)

_logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    timeout = aiohttp.ClientTimeout(total=600)
    session = aiohttp.ClientSession(timeout=timeout)

    session_registry.set_session(session)

    try:
        await get_kommuner()
    except Exception as err:
        # Appen skal starte selv om Kommuneinfo er nede; listen hentes ved første forespørsel
        _logger.warning('Could not preload kommuner: %s', err)

    healthcheck_task = start_scheduler()

    try:
        yield
    finally:
        if healthcheck_task:
            healthcheck_task.cancel()

            try:
                await healthcheck_task
            except asyncio.CancelledError:
                pass

        await session.close()
        session_registry.set_session(None)


app = FastAPI(root_path='/api', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'https://dok-arealanalyse-api.azurewebsites.net',
        'https://dok-arealanalyse-api-staging.azurewebsites.net',
        'http://localhost:5173',
        'http://localhost'
    ],
    allow_methods=['GET', 'POST'],
    allow_headers=['*'],
    expose_headers=[JOB_ID_HEADER],
    allow_credentials=True
)

app.add_middleware(
    GZipMiddleware,
    minimum_size=1000,
    compresslevel=5
)

app.include_router(dok_tema.router)
app.include_router(eiendom.router)
app.include_router(eksempler.router)
app.include_router(kommuner.router)
app.include_router(omrade.router)
app.include_router(plan.router)
app.include_router(pygeoapi.router)
app.include_router(sok.router)
app.include_router(status.router)


if __name__ == '__main__':
    uvicorn.run('dokanalyse-web-api.main:app',
                host='0.0.0.0', port=5001, reload=is_development())
