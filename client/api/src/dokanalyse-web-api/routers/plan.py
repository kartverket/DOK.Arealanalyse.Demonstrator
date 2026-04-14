from typing import Any, Dict
from fastapi import APIRouter, HTTPException, Response, status
from ..services import plan

router = APIRouter()


@router.get('/plan/reguleringsplan/{kommunenummer}/{plan_id}')
async def get_reguleringsplan(response: Response, kommunenummer: str, plan_id: str) -> Dict[str, Any] | None:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await plan.get_reguleringsplan(kommunenummer, plan_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente reguleringsplan {kommunenummer}_{plan_id}'
        )


@router.get('/plan/reguleringsplanforslag/{kommunenummer}/{plan_id}')
async def get_reguleringsplanforslag(response: Response, kommunenummer: str, plan_id: str) -> Dict[str, Any] | None:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await plan.get_reguleringsplanforslag(kommunenummer, plan_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente reguleringsplan {kommunenummer}_{plan_id}'
        )
