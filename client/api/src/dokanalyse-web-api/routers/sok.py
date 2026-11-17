import logging
from typing import Any, Dict
from fastapi import APIRouter, Response, HTTPException, status
from ..services import sok
from ..utils.helpers import describe_error

router = APIRouter()
_logger = logging.getLogger(__name__)

# Må registreres før /sok/{kommunenummer}, ellers tolkes «adresse» som et kommunenummer
@router.get('/sok/adresse')
async def search_for_adresse(q: str, response: Response) -> Dict[str, Any]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await sok.search_adresse(q)
    except Exception as err:
        _logger.error('Kunne ikke søke etter adresse: %s', describe_error(err))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke søke etter adresse'
        )


@router.get('/sok/{kommunenummer}')
async def search_for_eiendom(kommunenummer: str, q: str, response: Response) -> Dict[str, Any]:
    response.headers['Cache-Control'] = 'public, max-age=86400'    

    try:
        return await sok.search(kommunenummer, q)
    except Exception as err:
        _logger.error('Kunne ikke søke etter plan eller eiendom: %s', describe_error(err))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke søke etter plan eller eiendom'
        )
