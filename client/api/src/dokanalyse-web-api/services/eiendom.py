import json
import re
from io import BytesIO
from pathlib import Path
from collections import defaultdict
from typing import Any, Dict, List, Literal, Tuple
from lxml import etree as ET
from async_lru import alru_cache
from osgeo import ogr
from .kommuner import get_kommune_by_kommunenummer
from .common import get_polygons_from_geometries
from ..utils.session_registry import get_session


_ADRESSE_API_URL = 'https://ws.geonorge.no/adresser/v1/sok'

_MATRIKKEL_API_URL = 'https://api.kartverket.no/eiendom/v1/geokoding'

_adresse_api_query_params = {
    'objtype': 'Vegadresse',
    'utkoordsys': '4326',
    'treffPerSide': 10,
    'asciiKompatibel': 'true',
    'fuzzy': 'false'
}

_matrikkel_api_query_params = {
    'omrade': 'true',
    'utkoordsys': '4326'
}

_normalize_name_ignore = {'i', 'på', 'og', 'ved', 'under'}


async def get_eiendom_from_matrikkel(
    kommunenummer: str,
    gardsnummer: int,
    bruksnummer: int,
    festenummer: int | None
) -> Dict[str, Any] | None:
    params = {
        **_matrikkel_api_query_params,
        'kommunenummer': kommunenummer,
        'gardsnummer': gardsnummer,
        'bruksnummer': bruksnummer,
        'festenummer': festenummer or 0
    }

    key = json.dumps(params, sort_keys=True)

    return await _get_cached_eiendom_from_matrikkel(key)


async def search_by_matrikkel_no(kommunenummer: str, query_params: Dict[str, Any]) -> Dict[str, Any]:
    params = {**_adresse_api_query_params, 'kommunenummer': kommunenummer}
    params.update((key, value)
                  for key, value in query_params.items() if value is not None)

    async with get_session().get(_ADRESSE_API_URL, params=params) as response:
        response.raise_for_status()
        data = await response.json()

        return await _map_adresse_response(data, 'Eiendom')


async def search_by_adresse(kommunenummer, search_str: str) -> Dict[str, Any]:
    params = {
        **_adresse_api_query_params,
        'kommunenummer': kommunenummer,
        'sok': search_str
    }

    async with get_session().get(_ADRESSE_API_URL, params=params) as response:
        response.raise_for_status()
        data = await response.json()

        return await _map_adresse_response(data, 'Vegadresse')


@alru_cache(maxsize=256, ttl=86400)
async def _get_cached_eiendom_from_matrikkel(key: str) -> Dict[str, Any] | None:
    params: Dict[str, Any] = json.loads(key)

    async with get_session().get(_MATRIKKEL_API_URL, params=params) as response:
        response.raise_for_status()
        data = await response.json()

        return await _map_matrikkel_response(data)


async def _map_adresse_response(
    response: Dict[str, Any],
    type: Literal['Eiendom', 'Vegadresse']
) -> Dict[str, Any]:
    adresser: List[Dict[str, Any]] = response['adresser']
    features: List[Dict[str, Any]] = []

    for adresse in adresser:
        repr_punkt: Dict[str, Any] = adresse['representasjonspunkt']
        kommunenummer: str = adresse['kommunenummer']
        kommunenavn: str = _normalize_name(adresse['kommunenavn'])
        gardsnummer: int = adresse['gardsnummer']
        bruksnummer: int = adresse['bruksnummer']
        festenummer: int = adresse.get('festenummer', 0)
        matrikkelnummer = _get_matrikkelnummer(
            kommunenummer, gardsnummer, bruksnummer, festenummer)
        adressetekst: str = adresse['adressetekst']
        postnummer: str = adresse['postnummer']
        poststed: str = _normalize_name(adresse['poststed'])
        value = matrikkelnummer if type == 'Eiendom' else adressetekst

        feature = {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [
                    repr_punkt['lon'],
                    repr_punkt['lat']
                ]
            },
            'properties': {
                'type': type,
                'value': value,
                'data': {
                    'kommunenummer': kommunenummer,
                    'kommunenavn': kommunenavn,
                    'gardsnummer': gardsnummer,
                    'bruksnummer': bruksnummer,
                    'festenummer': festenummer,
                    'matrikkelnummer': matrikkelnummer,
                    'adressetekst': adressetekst,
                    'postnummer': postnummer,
                    'poststed': poststed
                }
            }
        }

        features.append(feature)

    return {
        'type': 'FeatureCollection',
        'features': features
    }


async def _map_matrikkel_response(response: Dict[str, Any]) -> Dict[str, Any] | None:
    feature: Dict[str, Any]
    geometries: List[Dict[str, Any]] = []

    for feature in response['features']:
        geometry: Dict[str, Any] = feature['geometry']
        geometries.append(geometry)                   

    return _matrikkel_geometries_to_geojson(geometries)


def _matrikkel_geometries_to_geojson(geometries: List[Dict[str, Any]]) -> Dict[str, Any] | None:
    if len(geometries) == 0:
        return None
    elif len(geometries) == 1:
        return geometries[0]

    ogr_geometries: List[ogr.Geometry] = []

    for geometry in geometries:
        ogr_geometry = _geometry_from_geojson(geometry)

        if ogr_geometry:
            ogr_geometries.append(ogr_geometry)

    multi_polygon = ogr.Geometry(ogr.wkbMultiPolygon)
    polygons = get_polygons_from_geometries(ogr_geometries)

    for polygon in polygons:
        multi_polygon.AddGeometry(polygon)

    return _geojson_from_geometry(multi_polygon)


def _get_matrikkelnummer(
    kommunenummer: str,
    gardsnummer: int,
    bruksnummer: int,
    festenummer: int
) -> str:
    matrikkel_nummer = f'{kommunenummer}-{gardsnummer}/{bruksnummer}'

    if festenummer != 0:
        matrikkel_nummer += f'/{festenummer}'

    return matrikkel_nummer


def _geojson_from_geometry(geometry: ogr.Geometry) -> Dict[str, Any] | None:
    try:
        json_str = geometry.ExportToJson()

        return json.loads(json_str)
    except:
        return None


def _geometry_from_geojson(geojson: Dict[str, Any]) -> ogr.Geometry | None:
    try:
        geojson_str = json.dumps(geojson)
        geometry: ogr.Geometry = ogr.CreateGeometryFromJson(geojson_str)

        return geometry if geometry else None
    except:
        return None


def _normalize_name(name: str) -> str:
    word_list = name.strip().lower().split()
    result = []

    for i, word in enumerate(word_list):
        if i > 0 and word in _normalize_name_ignore:
            result.append(word)
        else:
            result.append(word.title())

    return ' '.join(result)


__all__ = ['get_eiendom_from_matrikkel',
           'search_by_matrikkel_no', 'search_by_adresse']
