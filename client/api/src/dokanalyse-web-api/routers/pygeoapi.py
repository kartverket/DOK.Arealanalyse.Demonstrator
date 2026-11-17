import logging
from typing import Any, Awaitable, Dict, TypeVar
from uuid import UUID
from fastapi import APIRouter, Header, HTTPException, Query, Response, status
from pydantic import ValidationError
from ..services import job_metadata, pygeoapi, socket_io
from ..services.job_metadata import JobMetadata
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

    # Opplysningene om området lagres hos oss og sendes ikke til pygeoapi
    metadata = _get_metadata(payload.pop('metadata', None))

    async def save_metadata(job_id: str) -> None:
        if metadata is not None:
            await job_metadata.try_save(job_id, metadata)

    # Ved synkron kjøring er jobId kjent fra den første fremdriftsmeldingen, lenge før svaret kommer
    request_id = _register_request(payload, save_metadata if job_metadata.is_enabled() else None)

    try:
        body, job_id = await _call(pygeoapi.analyze(payload, respond_async), 'Kunne ikke kjøre DOK-analyse')
    finally:
        if request_id:
            socket_io.clear_job_id_callback(request_id)

    # Gjør det mulig å koble et synkront svar til jobben i jobblisten
    if job_id:
        response.headers[JOB_ID_HEADER] = job_id
        await save_metadata(job_id)

    return body


@router.get('/pygeoapi/jobs')
async def get_jobs(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
) -> Dict[str, Any]:
    body = await _call(pygeoapi.get_jobs(limit, offset), 'Kunne ikke hente DOK-analysene')
    await job_metadata.add_to_jobs(body['jobs'])

    return body


@router.get('/pygeoapi/jobs/{job_id}')
async def get_job(job_id: UUID) -> Dict[str, Any]:
    job = await _call(pygeoapi.get_job(job_id), 'Kunne ikke hente status for DOK-analysen')
    await job_metadata.add_to_jobs([job])

    return job


@router.get('/pygeoapi/jobs/{job_id}/results')
async def get_job_results(job_id: UUID) -> Dict[str, Any]:
    return await _call(pygeoapi.get_job_results(job_id), 'Kunne ikke hente resultatet av DOK-analysen')


def _get_metadata(value: Any) -> JobMetadata | None:
    if value is None:
        return None

    # Analysen kjøres uansett; da vises den bare uten beskrivelse i jobblisten
    try:
        return JobMetadata.model_validate(value)
    except ValidationError as err:
        # Bare feltene logges, siden verdiene kan inneholde adresser
        fields = sorted({'.'.join(str(loc) for loc in error['loc']) for error in err.errors()})
        _logger.warning('Ignoring invalid job metadata (fields: %s)', ', '.join(fields) or '-')
        return None


def _register_request(payload: Dict[str, Any], on_job_id: socket_io.JobIdCallback | None) -> str | None:
    # Fremdriften sendes til en egen mottaker-id for forespørselen, som Socket.IO videresender til front-end
    inputs = payload.get('inputs')

    if not isinstance(inputs, dict):
        return None

    correlation_id = inputs.get('correlationId')

    if not isinstance(correlation_id, str):
        return None

    request_id = socket_io.register_request(correlation_id, on_job_id)

    if request_id:
        payload['inputs'] = {**inputs, 'correlationId': request_id}

    return request_id


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
