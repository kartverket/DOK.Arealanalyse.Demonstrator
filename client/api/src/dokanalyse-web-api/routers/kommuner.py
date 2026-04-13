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


@router.get('/kommuner/plan')
async def get_kommuner_for_plan(
    response: Response
) -> Dict[str, Any]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await kommuner.get_kommuner_for_plan()
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke hente kommuner for plan'
        )


@router.get('/kommuner/{kommunenummer}')
async def get_kommune_by_kommunenummer(
    kommunenummer: str,
    response: Response
) -> Dict[str, Any] | None:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await kommuner.get_kommune_by_kommunenummer()
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente kommune med kommunenummer {kommunenummer}'
        )
