import logging
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from ..services import eiendom
from ..utils.helpers import describe_error

router = APIRouter()
_logger = logging.getLogger(__name__)


@router.get('/eiendom/{kommunenummer}/{gardsnummer}/{bruksnummer}')
@router.get('/eiendom/{kommunenummer}/{gardsnummer}/{bruksnummer}/{festenummer}')
async def get_eiendom(
    kommunenummer: str,
    gardsnummer: int,
    bruksnummer: int,
    festenummer: int | None = None
) -> Dict[str, Any] | None:
    try:
        return await eiendom.get_eiendom_from_matrikkel(kommunenummer, gardsnummer, bruksnummer, festenummer)
    except Exception as err:
        _logger.error(
            'Kunne ikke hente eiendom fra Matrikkel API: %s', describe_error(err))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente eiendom fra Matrikkel API'
        )
