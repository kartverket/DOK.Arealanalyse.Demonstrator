import logging
from typing import Any, Awaitable, Dict, TypeVar
from uuid import UUID
from fastapi import APIRouter, Header, HTTPException, Query, Response, status
from ..services import pygeoapi
from ..services.exceptions import HttpError
from ..utils.helpers import describe_error

JOB_ID_HEADER = 'X-Job-Id'

router = APIRouter()
_logger = logging.getLogger(__name__)

T = TypeVar('T')


@router.post('/pygeoapi')
async def analyze(
    payload: Dict[str, Any],
    response: Response,
    prefer: str | None = Header(default=None)
) -> Dict[str, Any]:
    # Bare «respond-async» videresendes til pygeoapi
    respond_async = prefer is not None and 'respond-async' in prefer.lower()

    body, job_id = await _call(pygeoapi.analyze(payload, respond_async), 'Kunne ikke kjøre DOK-analyse')

    # Gjør det mulig å koble et synkront svar til jobben i jobblisten
    if job_id:
        response.headers[JOB_ID_HEADER] = job_id

    return body


@router.get('/pygeoapi/jobs')
async def get_jobs(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
) -> Dict[str, Any]:
    return await _call(pygeoapi.get_jobs(limit, offset), 'Kunne ikke hente DOK-analysene')


@router.get('/pygeoapi/jobs/{job_id}')
async def get_job(job_id: UUID) -> Dict[str, Any]:
    return await _call(pygeoapi.get_job(job_id), 'Kunne ikke hente status for DOK-analysen')


@router.get('/pygeoapi/jobs/{job_id}/results')
async def get_job_results(job_id: UUID) -> Dict[str, Any]:
    return await _call(pygeoapi.get_job_results(job_id), 'Kunne ikke hente resultatet av DOK-analysen')


async def _call(request: Awaitable[T], message: str) -> T:
    try:
        return await request
    except HttpError as err:
        description = err.body.get('description') if err.body else None
        detail = f'{message}: {description}' if description else message
        _logger.error('%s: HTTP %s', message, err.status)

        raise HTTPException(
            status_code=err.status,
            detail=detail
        )
    except Exception as err:
        _logger.error('%s: %s', message, describe_error(err))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'{message}. En ubehandlet feil har oppstått.'
        )
