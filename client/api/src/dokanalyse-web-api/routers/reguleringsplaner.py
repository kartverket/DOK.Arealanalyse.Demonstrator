from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, Response, status
from ..services import reguleringsplaner

router = APIRouter()


@router.get('/reguleringsplaner/planids/{kommunenummer}')
async def get_plan_ids(response: Response, kommunenummer: str) -> List[str]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await reguleringsplaner.get_plan_ids(kommunenummer)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente planidentifikasjoner for kommune {kommunenummer}'
        )


@router.get('/reguleringsplaner/{kommunenummer}/{plan_id}')
async def get_reguleringsplan(response: Response, kommunenummer: str, plan_id: str) -> Dict[str, Any] | None:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await reguleringsplaner.get_reguleringsplan(kommunenummer, plan_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente reguleringsplan {kommunenummer}_{plan_id}'
        )