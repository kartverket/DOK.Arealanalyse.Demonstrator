import logging
from typing import Any, Dict, List
from fastapi import APIRouter, Response, HTTPException, status
from ..services import eksempler
from ..utils.helpers import describe_error

router = APIRouter()
_logger = logging.getLogger(__name__)


@router.get('/eksempler')
async def get_eksempler(
    response: Response
) -> List[Dict[str, Any]]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await eksempler.get_eksempler()
    except Exception as err:
        _logger.error('Kunne ikke hente eksempler: %s', describe_error(err))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke hente eksempler'
        )
