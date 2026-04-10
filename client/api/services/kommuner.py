import os
from typing import Any, Dict, List
import aiohttp
from async_lru import alru_cache

_API_URL = 'https://register.geonorge.no/api/sosi-kodelister/kommunenummer.json'


@alru_cache(maxsize=None)
async def get_kommuner() -> List[Dict[str, Any]]:
    excluded = _get_excluded_kommuner()

    async with aiohttp.ClientSession() as session:
        async with session.get(_API_URL) as response:
            response.raise_for_status()

            data = await response.json()
            items: List[Dict[str, Any]] = data['containeditems']
            kommuner: List[Dict[str, Any]] = []

            for item in items:
                if item['status'] != 'Gyldig':
                    continue

                kommunenummer = item['codevalue']

                if kommunenummer in excluded:
                    continue

                kommuner.append({
                    'kommunenummer': kommunenummer,
                    'kommunenavn': item['label']
                })

            return sorted(kommuner, key=lambda k: k['kommunenavn'])


@alru_cache(maxsize=None)
async def get_kommune_by_kommunenummer(kommunenummer: str) -> Dict[str, Any] | None:
    kommuner = await get_kommuner()

    return next(kommune for kommune in kommuner if kommune['kommunenummer'] == kommunenummer)


def _get_excluded_kommuner() -> List[str]:
    to_exclude = os.getenv('EXCLUDED_KOMMUNER')

    if not to_exclude:
        return []

    return [kommunenummer.strip() for kommunenummer in to_exclude.split(',')]


__all__ = ['get_kommuner', 'get_kommune_by_kommunenummer']
