import asyncio
from datetime import datetime, timezone
from os import environ
from typing import Any, Dict, List, Mapping, Tuple
from uuid import UUID
import aiohttp
from .exceptions import HttpError
from ..utils.session_registry import get_session

_BASE_URL = environ['PYGEOAPI_API_URL'].rstrip('/')
_PROCESS_ID = 'dokanalyse'

# Feltene fra jobbstatusen som sendes videre; «links» inneholder interne pygeoapi-URL-er
_JOB_FIELDS = ('jobID', 'processID', 'type', 'status', 'message', 'progress',
               'created', 'started', 'finished', 'updated')
_JOB_TIMESTAMP_FIELDS = ('created', 'started', 'finished', 'updated')

# Sikring mot evig løkke hvis pygeoapi rapporterer feil antall jobber
_MAX_JOB_PAGES = 1000


async def analyze(payload: Dict[str, Any], respond_async: bool = False) -> Tuple[Dict[str, Any], str | None]:
    url = f'{_BASE_URL}/processes/{_PROCESS_ID}/execution'
    headers = {'Prefer': 'respond-async'} if respond_async else None
    body, response_headers = await _request_with_headers('POST', url, json=payload, headers=headers)

    # pygeoapi setter «Location: .../jobs/{jobId}» også ved synkron kjøring, når process manageren
    # støtter jobber (TinyDB, PostgreSQL osv.). Med Dummy-manageren finnes ingen jobb.
    return body, _get_job_id(response_headers.get('Location'))


async def get_job(job_id: UUID) -> Dict[str, Any]:
    body = await _request('GET', f'{_BASE_URL}/jobs/{job_id}', params={'f': 'json'})

    return _to_job(body)


async def get_jobs(limit: int, offset: int) -> Dict[str, Any]:
    jobs = [job for job in await _get_all_jobs() if job.get('processID') == _PROCESS_ID]
    jobs.sort(key=lambda job: job.get('created') or '', reverse=True)

    return {
        'jobs': [_to_job(job) for job in jobs[offset:offset + limit]],
        'numberMatched': len(jobs)
    }


async def get_job_results(job_id: UUID) -> Dict[str, Any]:
    return await _request('GET', f'{_BASE_URL}/jobs/{job_id}/results', params={'f': 'json'})


async def _get_all_jobs() -> List[Dict[str, Any]]:
    # Pagineringen i pygeoapi varierer mellom process managerne: PostgreSQL ignorerer limit og offset,
    # mens TinyDB paginerer før sorteringen. Derfor hentes alle jobbene, og sorteringen og pagineringen
    # gjøres her.
    jobs: List[Dict[str, Any]] = []

    for _ in range(_MAX_JOB_PAGES):
        body = await _request('GET', f'{_BASE_URL}/jobs', params={'f': 'json', 'offset': len(jobs)})
        page = body.get('jobs') or []
        jobs.extend(page)

        if not page or len(jobs) >= body.get('numberMatched', 0):
            break

    return jobs


def _to_job(body: Dict[str, Any]) -> Dict[str, Any]:
    job = {key: body[key] for key in _JOB_FIELDS if key in body}

    for key in _JOB_TIMESTAMP_FIELDS:
        if isinstance(job.get(key), str):
            job[key] = _to_utc(job[key])

    return job


def _to_utc(timestamp: str) -> str:
    # pygeoapi lagrer tidene i UTC, men PostgreSQL-manageren returnerer dem uten tidssone
    try:
        value = datetime.fromisoformat(timestamp)
    except ValueError:
        return timestamp

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)

    return value.isoformat()


def _get_job_id(location: str | None) -> str | None:
    if not location:
        return None

    try:
        return str(UUID(location.rstrip('/').rsplit('/', 1)[-1]))
    except ValueError:
        return None


async def _request(method: str, url: str, **kwargs: Any) -> Dict[str, Any]:
    body, _ = await _request_with_headers(method, url, **kwargs)

    return body


async def _request_with_headers(method: str, url: str, **kwargs: Any) -> Tuple[Dict[str, Any], Mapping[str, str]]:
    try:
        async with get_session().request(method, url, **kwargs) as response:
            if response.status == 404:
                raise HttpError(404)

            try:
                body = await response.json(content_type=None)
            except ValueError:
                body = None

            if response.status >= 400:
                raise HttpError(response.status, body if isinstance(body, dict) else None)

            if not isinstance(body, dict):
                raise HttpError(502)

            return body, response.headers
    except aiohttp.ClientError:
        raise HttpError(502)
    except asyncio.TimeoutError:
        raise HttpError(504)
