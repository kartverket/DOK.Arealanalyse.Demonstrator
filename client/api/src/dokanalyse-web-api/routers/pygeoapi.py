from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from ..services import pygeoapi
from ..services.exceptions import HttpError

router = APIRouter()


@router.post('/pygeoapi')
async def analyze(
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    try:
        return await pygeoapi.analyze(payload)
    except HttpError as err:
        detail = 'Kunne ikke kjøre DOK-analyse'
        detail = f'{detail}: {err.body["description"]}' if err.body else detail

        raise HTTPException(
            status_code=err.status,
            detail=detail
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Kunne ikke kjøre DOK-analyse. En unbehandlet feil har oppstått.'
        )
