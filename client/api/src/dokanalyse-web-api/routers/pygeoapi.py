import logging
from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from ..services import pygeoapi
from ..services.exceptions import HttpError
from ..utils.helpers import describe_error

router = APIRouter()
_logger = logging.getLogger(__name__)


@router.post('/pygeoapi')
async def analyze(
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    try:
        return await pygeoapi.analyze(payload)
    except HttpError as err:
        description = err.body.get('description') if err.body else None
        detail = 'Kunne ikke kjøre DOK-analyse'
        detail = f'{detail}: {description}' if description else detail
        _logger.error('DOK-analysen feilet: HTTP %s', err.status)

        raise HTTPException(
            status_code=err.status,
            detail=detail
        )
    except Exception as err:
        _logger.error('DOK-analysen feilet: %s', describe_error(err))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Kunne ikke kjøre DOK-analyse. En ubehandlet feil har oppstått.'
        )
