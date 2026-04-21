from typing import Any, Dict
from fastapi import APIRouter, HTTPException, status
from ..services import validering

router = APIRouter()


@router.post('/valider')
async def validate(
    geometry: Dict[str, Any]
) -> Dict[str, Any]:
    try:
        return validering.valider(geometry)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Kunne ikke validere geometri. En unbehandlet feil har oppstått.'
        )
