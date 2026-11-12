import os
import json
import logging
from pathlib import Path
from typing import Any, Dict, List
from async_lru import alru_cache
from .common import is_cache_valid, read_file_from_disk, write_file_to_disk
from ..utils.session_registry import get_session

_FYLKERKOMMUNER_API_URL = 'https://api.kartverket.no/kommuneinfo/v1/fylkerkommuner'
_PUNKT_API_URL = 'https://api.kartverket.no/kommuneinfo/v1/punkt'
_TTL = 86400 * 180

_fylkerkommuner_query_params = {
    'utkoordsys': 4326,
    'filtrer': 'kommuner.kommunenummer,kommuner.kommunenavnNorsk,kommuner.avgrensningsboks'
}

_punkt_query_params = {
    'koordsys': 4326,
    'filtrer': 'kommunenummer'
}

_cache_path = Path('/tmp/kommuner.geojson')

_logger = logging.getLogger(__name__)


@alru_cache(maxsize=None, ttl=_TTL)
async def get_kommuner() -> Dict[str, Any]:
    if is_cache_valid(_cache_path, 180):
        try:
            return read_file_from_disk(_cache_path)
        except (OSError, ValueError) as err:
            _logger.warning('Could not read cached kommuner: %s', err)

    return await get_and_cache_kommuner()


async def get_kommune_by_point(lon: float, lat: float) -> Dict[str, Any] | None:
    kommunenummer = await _fetch_kommunenummer_by_point(lon, lat)

    return await get_kommune_by_kommunenummer(kommunenummer)


@alru_cache(maxsize=None, ttl=_TTL)
async def get_kommune_by_kommunenummer(kommunenummer: str) -> Dict[str, Any] | None:
    kommuner = await get_kommuner()
    features = kommuner['features']

    return next((feature for feature in features if feature['properties']['kommunenummer'] == kommunenummer), None)


async def get_and_cache_kommuner() -> Dict[str, Any]:
    async with get_session().get(_FYLKERKOMMUNER_API_URL, params=_fylkerkommuner_query_params) as response:
        response.raise_for_status()
        data = await response.json()

    kommuner = _map_response(data)

    try:
        write_file_to_disk(_cache_path, json.dumps(
            kommuner, ensure_ascii=False))
    except OSError as err:
        _logger.warning('Could not cache kommuner: %s', err)

    return kommuner


async def _fetch_kommunenummer_by_point(lon: float, lat: float) -> str:
    params = {
        **_punkt_query_params,
        'ost': lon,
        'nord': lat
    }

    async with get_session().get(_PUNKT_API_URL, params=params) as response:
        response.raise_for_status()
        data = await response.json()

        return data['kommunenummer']


def _map_response(response: List[Dict[str, Any]]) -> Dict[str, Any]:
    features: List[Dict[str, Any]] = []

    for fylke in response:
        for kommune in fylke['kommuner']:
            geom = kommune['avgrensningsboks']
            points = geom['coordinates'][0]
            kommunenummer = kommune['kommunenummer']

            features.append({
                'type': 'Feature',
                'id': kommunenummer,
                'geometry': {
                    'type': 'MultiPoint',
                    'coordinates': [
                        points[0],
                        points[2]
                    ]
                },
                'properties': {
                    'kommunenummer': kommune['kommunenummer'],
                    'kommunenavn': kommune['kommunenavnNorsk']
                }
            })

    sorted_features = sorted(
        features, key=lambda feature: feature['properties']['kommunenavn'])

    return {
        'type': 'FeatureCollection',
        'features': sorted_features
    }


__all__ = ['get_kommuner', 'get_kommune_by_kommunenummer',
           'get_and_cache_kommuner']
