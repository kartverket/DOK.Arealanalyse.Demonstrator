import os
import json
import math
import asyncio
from typing import Any, Dict, List, Tuple
import aiohttp
from async_lru import alru_cache
from osgeo import ogr
from .common import add_geojson_crs, get_polygons_from_geometries
from ..utils.session_registry import get_session

_API_URL = 'https://nap.ft.dibk.no/services/rest/reguleringsplaner/vn2/collections/rpomrade/items'
_LIMIT = 500
_MAX_CONCURRENT = 5
_DEFAULT_CRS = 'http://www.opengis.net/def/crs/EPSG/0/25833'
_DEFAULT_EPSG = 25833


@alru_cache(ttl=86400)
async def get_plan_ids(municipality_number: str) -> List[str]:
    semaphore = asyncio.Semaphore(_MAX_CONCURRENT)

    all_plan_ids, number_matched = await _fetch_plan_ids(semaphore, municipality_number, 0)
    num_pages = math.ceil(number_matched / _LIMIT)
    offsets = [i * _LIMIT for i in range(num_pages)][1:]

    tasks: List[asyncio.Task[Tuple[List[str], int]]] = []

    async with asyncio.TaskGroup() as tg:
        for offset in offsets:
            task = tg.create_task(_fetch_plan_ids(
                semaphore, municipality_number, offset))
            tasks.append(task)

    for task in tasks:
        plan_ids, _ = task.result()
        all_plan_ids.extend(plan_ids)

    return sorted(set(all_plan_ids))


@alru_cache(ttl=86400)
async def get_reguleringsplan(municipality_number: str, plan_id: str) -> Dict[str, Any] | None:
    params = {
        'kopidata.områdeId': municipality_number,
        'arealplanId.planidentifikasjon': plan_id,
        'crs': _DEFAULT_CRS
    }

    async with get_session().get(_API_URL, params=params, auth=_get_auth()) as response:
        response.raise_for_status()

        data = await response.json()
        features: List[Dict[str, Any]] = data['features']

        if not features:
            return None

        geometries: List[Dict[str, Any]] = []

        for feature in features:
            geometries.append(feature['geometry'])

        if not geometries:
            return None

        return _create_feature(features[0], geometries)


async def _fetch_plan_ids(
    semaphore: asyncio.Semaphore,
    municipality_number: str,
    offset: int
) -> Tuple[List[str], int]:
    async with semaphore:
        params = _get_query_params(municipality_number, offset)
        plan_ids: List[str] = []

        async with get_session().get(_API_URL, params=params, auth=_get_auth()) as response:
            response.raise_for_status()

            data = await response.json()
            number_matched: int = data['numberMatched']
            features: List[Dict[str, Any]] = data['features']

            for feature in features:
                plan_id: str = feature['properties']['arealplanId']['planidentifikasjon']
                plan_ids.append(plan_id)

            return plan_ids, number_matched


def _create_feature(feature: Dict[str, Any], geometries: List[Dict[str, Any]]) -> Dict[str, Any]:
    geometry: Dict[str, Any]

    if len(geometries) == 1:
        geometry = geometries[0]
    else:
        geometry = _create_multi_polygon(geometries)

    properties: Dict[str, Any] = feature['properties']

    new_feature: Dict[str, Any] = {
        'type': 'Feature',
        'geometry': geometry,
        'properties': {
            'planId': properties['arealplanId']['planidentifikasjon'],
            'kommunenummer': properties['kopidata']['områdeId'],
            'plannavn': properties['plannavn']
        }
    }

    add_geojson_crs(new_feature, _DEFAULT_EPSG)

    return new_feature


def _create_multi_polygon(geometries: List[Dict[str, Any]]) -> Dict[str, Any]:
    ogr_geometries: List[ogr.Geometry] = []

    for geometry in geometries:
        json_str = json.dumps(geometry)
        ogr_geometry: ogr.Geometry = ogr.CreateGeometryFromJson(json_str)
        ogr_geometries.append(ogr_geometry)

    multi_polygon = ogr.Geometry(ogr.wkbMultiPolygon)
    polygons = get_polygons_from_geometries(ogr_geometries)

    for polygon in polygons:
        multi_polygon.AddGeometry(polygon)

    json_str = multi_polygon.ExportToJson()

    return json.loads(json_str)


def _get_auth() -> aiohttp.BasicAuth:
    username = os.environ['NAP_USERNAME']
    password = os.environ['NAP_PASSWORD']

    return aiohttp.BasicAuth(username, password)


def _get_query_params(municipality_number: str, offset: int) -> Dict[str, Any]:
    return {
        'kopidata.områdeId': municipality_number,
        'properties': 'arealplanId.planidentifikasjon',
        'skipGeometry': 'true',
        'limit': _LIMIT,
        'offset': offset
    }


__all__ = ['get_plan_ids', 'get_reguleringsplan']
