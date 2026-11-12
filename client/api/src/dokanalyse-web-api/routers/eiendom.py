import logging
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from ..services import eiendom
from ..utils.helpers import describe_error

router = APIRouter()
_logger = logging.getLogger(__name__)


@router.post('/eiendom')
async def get_eiendom(geometry: Dict[str, Any]) -> Dict[str, Any] | None:
    try:
        return await eiendom.get_eiendom_from_matrikkel(geometry)
    except Exception as err:
        _logger.error('Kunne ikke hente eiendom fra Matrikkel WFS: %s', describe_error(err))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente eiendom fra Matrikkel WFS'
        )
