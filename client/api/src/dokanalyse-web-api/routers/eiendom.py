from typing import Any, Dict
from fastapi import APIRouter, Response, HTTPException, status
from ..services import eiendom

router = APIRouter()


@router.get('/eiendom/{kommunenummer}/sok')
async def search_for_eiendom(kommunenummer: str, q: str, response: Response) -> Dict[str, Any]:
    response.headers['Cache-Control'] = 'public, max-age=86400'    

    try:
        return await eiendom.search(kommunenummer, q)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke søke etter eiendom'
        )


@router.post('/eiendom')
async def get_eiendom(geometry: Dict[str, Any]) -> Dict[str, Any] | None:
    try:
        return await eiendom.get_eiendom_from_matrikkel(geometry)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Kunne ikke hente eiendom fra Matrikkel WFS'
        )