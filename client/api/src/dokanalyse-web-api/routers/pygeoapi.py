from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from ..services import pygeoapi

router = APIRouter()


@router.post('/pygeoapi')
async def analyze(
    payload: Dict[str, Any]
) -> Dict[str, Any]:
    try:
        return await pygeoapi.analyze(payload)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke analysere'
        )
