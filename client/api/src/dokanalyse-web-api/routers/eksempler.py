from typing import Any, Dict, List
from fastapi import APIRouter, Response, HTTPException, status
from ..services import eksempler

router = APIRouter()


@router.get('/eksempler')
async def get_dok_tema(
    response: Response
) -> List[Dict[str, Any]]:
    response.headers['Cache-Control'] = 'public, max-age=86400'

    try:
        return await eksempler.get_eksempler()
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Kunne ikke hente eksempler'
        )
