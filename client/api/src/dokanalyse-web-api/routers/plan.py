import logging
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, Response, status
from ..services import plan
from ..utils.helpers import describe_error

router = APIRouter()
_logger = logging.getLogger(__name__)


@router.get('/plan/reguleringsplan/{kommunenummer}/{plan_id}')
async def get_reguleringsplan(response: Response, kommunenummer: str, plan_id: str) -> Dict[str, Any] | None:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await plan.get_reguleringsplan(kommunenummer, plan_id)
    except Exception as err:
        _logger.error('Kunne ikke hente reguleringsplan: %s', describe_error(err))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente reguleringsplan {kommunenummer}_{plan_id}'
        )


@router.get('/plan/reguleringsplanforslag/{kommunenummer}/{plan_id}')
async def get_reguleringsplanforslag(response: Response, kommunenummer: str, plan_id: str) -> Dict[str, Any] | None:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await plan.get_reguleringsplanforslag(kommunenummer, plan_id)
    except Exception as err:
        _logger.error('Kunne ikke hente reguleringsplanforslag: %s', describe_error(err))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente reguleringsplan {kommunenummer}_{plan_id}'
        )
