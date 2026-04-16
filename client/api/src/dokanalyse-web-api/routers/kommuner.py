from typing import Any, Dict
from fastapi import APIRouter, Response, HTTPException, status
from ..services import kommuner

router = APIRouter()


@router.get('/kommuner')
async def get_kommuner(
    response: Response
) -> Dict[str, Any]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await kommuner.get_kommuner()
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke hente kommuner'
        )


@router.get('/kommuner/punkt/{lon}/{lat}')
async def get_kommune_by_point(
    lon: float,
    lat: float
) -> Dict[str, Any] | None:
    try:
        return await kommuner.get_kommune_by_point(lon, lat)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke finne kommune for punktet {lon}, {lat}'
        )
