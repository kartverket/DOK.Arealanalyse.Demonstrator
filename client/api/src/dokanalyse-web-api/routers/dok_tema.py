import logging
from typing import List
from fastapi import APIRouter, Response, HTTPException, status
from ..services import dok_tema
from ..utils.helpers import describe_error

router = APIRouter()
_logger = logging.getLogger(__name__)


@router.get('/doktema')
async def get_dok_tema(response: Response) -> List[str]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await dok_tema.get_dok_tema()
    except Exception as err:
        _logger.error('Kunne ikke hente DOK-temaer: %s', describe_error(err))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke hente DOK-temaer'
        )
