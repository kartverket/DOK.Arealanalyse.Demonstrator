from typing import Any, Dict, List
from async_lru import alru_cache
from ..utils.session_registry import get_session

_API_URL = 'https://register.geonorge.no/api/dok-statusregisteret.json'


@alru_cache(ttl=86400)
async def get_dok_tema() -> List[str]:
    result = await _fetch_dok_tema()
    items: List[Dict[str, Any]] = result['containeditems']
    themes: List[str] = []

    for item in items:
        status: str = item['status']

        if status != 'Gyldig':
            continue

        theme: str = item['theme']
        themes.append(theme)

    return sorted(list(set(themes)))


async def _fetch_dok_tema() -> Dict[str, Any]:
    async with get_session().get(_API_URL) as response:
        response.raise_for_status()

        return await response.json()


__all__ = ['get_dok_tema']
