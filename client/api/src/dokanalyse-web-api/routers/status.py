import asyncio
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Literal
from fastapi import APIRouter, HTTPException, Query, Response, status
from ..services.healthcheck import stats, store

router = APIRouter()

_CACHE_CONTROL = 'public, max-age=60'


@router.get('/status')
async def get_status(response: Response) -> Dict[str, Any]:
    response.headers['Cache-Control'] = _CACHE_CONTROL

    return await asyncio.to_thread(stats.get_overview)


@router.get('/status/statistikk')
async def get_statistics(
    response: Response,
    dager: int = Query(30, ge=1, le=365),
    inaktive: bool = False
) -> List[Dict[str, Any]]:
    response.headers['Cache-Control'] = _CACHE_CONTROL

    return await asyncio.to_thread(stats.get_statistics, dager, inaktive)


@router.get('/status/tidslinje')
async def get_timeline(
    response: Response,
    dager: int = Query(30, ge=1, le=365),
    opplosning: Literal['time', 'dag'] = 'dag',
    mal: str | None = None,
    inaktive: bool = False
) -> Dict[str, Any]:
    response.headers['Cache-Control'] = _CACHE_CONTROL
    resolution = 'hour' if opplosning == 'time' else 'day'

    if resolution == 'hour' and dager > 31:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Oppløsning per time støttes for maks 31 dager'
        )

    return await asyncio.to_thread(stats.get_timeline, dager, resolution, mal, inaktive)


@router.get('/status/hendelser')
async def get_incidents(
    response: Response,
    dager: int = Query(30, ge=1, le=365),
    type: Literal['dataset', 'service', 'endpoint'] | None = None,
    maks: int = Query(500, ge=1, le=5000),
    inaktive: bool = False
) -> Dict[str, Any]:
    response.headers['Cache-Control'] = _CACHE_CONTROL

    return await asyncio.to_thread(stats.get_incidents, dager, type, maks, inaktive)


@router.get('/status/mal/{target_id}')
async def get_target_history(
    response: Response,
    target_id: str,
    dager: int = Query(7, ge=1, le=90)
) -> Dict[str, Any]:
    response.headers['Cache-Control'] = _CACHE_CONTROL
    target = await asyncio.to_thread(store.get_target, target_id)

    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f'Fant ikke målet {target_id}'
        )

    since = datetime.now(timezone.utc) - timedelta(days=dager)
    history = await asyncio.to_thread(store.get_target_history, target_id, since)

    return {
        'target': target,
        'history': history
    }
