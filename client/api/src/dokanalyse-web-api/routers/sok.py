from typing import Any, Dict
from fastapi import APIRouter, Response, HTTPException, status
from ..services import sok

router = APIRouter()

@router.get('/sok/{kommunenummer}')
async def search_for_eiendom(kommunenummer: str, q: str, response: Response) -> Dict[str, Any]:
    response.headers['Cache-Control'] = 'public, max-age=86400'    

    try:
        return await sok.search(kommunenummer, q)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke søke etter plan eller eiendom'
        )