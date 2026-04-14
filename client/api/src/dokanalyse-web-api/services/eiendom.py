import json
import re
from io import BytesIO
from pathlib import Path
from collections import defaultdict
from typing import Any, Dict, List, Tuple
from lxml import etree as ET
from async_lru import alru_cache
from osgeo import ogr
from .kommuner import get_kommune_by_kommunenummer
from .common import get_polygons_from_geometries
from ..utils.session_registry import get_session


_ADRESSE_API_URL = 'https://ws.geonorge.no/adresser/v1/sok'

_MATRIKKEL_API_URL = 'https://api.kartverket.no/eiendom/v1/geokoding'

_WFS_URL = 'https://wfs.geonorge.no/skwms1/wfs.matrikkelen-eiendomskart-teig'
_WFS_LAYER = 'Teig'
_WFS_GEOM_FIELD = 'område'
_WFS_OUT_CRS = 'urn:ogc:def:crs:OGC:1.3:CRS84'

_wfs_request_xml_path = Path(__file__).parent.joinpath(
    'wfs_request.xml.txt').resolve()

_adresse_query_params = {
    'objtype': 'Vegadresse',
    'utkoordsys': '4326',
    'treffPerSide': 10,
    'asciiKompatibel': 'true',
    'fuzzy': 'false'
}

_matrikkel_query_params = {
    'omrade': 'false',
    'utkoordsys': '4326'
}


async def get_eiendom_from_matrikkel(geometry: Dict[str, Any]) -> Dict[str, Any] | None:
    geojson_str = _get_geojson_str(geometry)

    return await _get_cached_eiendom_from_matrikkel(geojson_str)


async def search_by_matrikkel_no(kommunenummer: str, query_params: Dict[str, Any]) -> Dict[str, Any]:
    params = {**_matrikkel_query_params, 'kommunenummer': kommunenummer}
    params.update((key, value)
                  for key, value in query_params.items() if value is not None)

    async with get_session().get(_MATRIKKEL_API_URL, params=params) as response:
        response.raise_for_status()
        data = await response.json()

        return await _map_matrikkel_response(data)


async def search_by_adresse(kommunenummer, search_str: str) -> Dict[str, Any]:
    params = {
        **_adresse_query_params,
        'kommunenummer': kommunenummer,
        'sok': search_str
    }

    async with get_session().get(_ADRESSE_API_URL, params=params) as response:
        response.raise_for_status()
        data = await response.json()

        return await _map_adresse_response(data, search_str)


@alru_cache(maxsize=256, ttl=86400)
async def _get_cached_eiendom_from_matrikkel(geojson_str: str) -> Dict[str, Any] | None:
    gml_str = _gml_from_geojson_str(geojson_str)

    if not gml_str:
        return None

    request_xml = _create_wfs_request_xml(
        _WFS_LAYER, _WFS_GEOM_FIELD, gml_str, _WFS_OUT_CRS)

    response = await _query_wfs(_WFS_URL, request_xml)

    prop_mappings = {
        'kommunenummer': 'kommunenummer',
        'matrikkelnummer': 'matrikkelnummerTekst'
    }

    results = _parse_wfs_response(
        response, _WFS_LAYER, _WFS_GEOM_FIELD, prop_mappings)

    geometries = [result[0] for result in results]

    if not geometries:
        return None

    properties = {**results[0][1]}
    properties['tittel'] = f'Eiendom {properties["kommunenummer"]}-{properties["matrikkelnummer"]}'

    return {
        'type': 'Feature',
        'geometry': _wfs_geometries_to_geojson(geometries),
        'properties': properties
    }


async def _query_wfs(base_url: str, xml_body: str) -> bytes:
    url = f'{base_url}?service=WFS&version=2.0.0'

    async with get_session().post(url, data=xml_body) as response:
        response.raise_for_status()

        return await response.read()


def _parse_wfs_response(
    response: bytes,
    layer: str,
    geom_field: str,
    prop_mappings: Dict[str, str]
) -> List[Tuple[ogr.Geometry, Dict[str, Any]]]:
    source = BytesIO(response)
    context = ET.iterparse(
        source, events=['end'], tag='{*}' + layer, huge_tree=True)

    geom_path = f'.//{{*}}{geom_field}/*'
    results: List[Tuple[ogr.Geometry, Dict[str, Any]]] = []

    for _, elem in context:
        geom_elem = elem.find(geom_path)

        if geom_elem is None:
            elem.clear()
            continue

        gml_str = ET.tostring(geom_elem, encoding='unicode')
        geometry = _geometry_from_gml(gml_str)

        if geometry:
            properties: Dict[str, Any] = {}

            for prop_name, path in prop_mappings.items():
                properties[prop_name] = elem.findtext(f'.//{{*}}{path}')

            results.append((geometry, properties))

        geom_elem.clear()
        elem.clear()

    del context

    return results


def _wfs_geometries_to_geojson(geometries: List[ogr.Geometry]) -> Dict[str, Any] | None:
    if len(geometries) == 0:
        return None
    elif len(geometries) == 1:
        return _geojson_from_geometry(geometries[0])

    multi_polygon = ogr.Geometry(ogr.wkbMultiPolygon)
    polygons = get_polygons_from_geometries(geometries)

    for polygon in polygons:
        multi_polygon.AddGeometry(polygon)

    return _geojson_from_geometry(multi_polygon)


async def _map_matrikkel_response(response: Dict[str, Any]) -> Dict[str, Any]:
    groupings: defaultdict[str, List[Dict[str, Any]]] = defaultdict(list)
    teig: Dict[str, Any]

    for teig in response['features']:
        matrikkelnummer = _get_matrikkelnummer(teig['properties'])
        groupings[matrikkelnummer].append(teig)

    sorted_groupings = dict(sorted(groupings.items()))
    features: List[Dict[str, Any]] = []

    for matrikkelnummer, teiger in sorted_groupings.items():
        teig = teiger[0]

        if len(teiger) > 1:
            geometry = {
                'type': 'MultiPoint',
                'coordinates': [feature['geometry']['coordinates'] for feature in teiger]
            }
        else:
            geometry = teig['geometry']

        kommunenummer = teig['properties']['kommunenummer']
        kommune = await get_kommune_by_kommunenummer(kommunenummer)

        feature = {
            'type': 'Feature',
            'geometry': geometry,
            'properties': {
                'type': 'Eiendom',
                'value': teig['properties']['matrikkelnummertekst'],
                'data': {
                    'matrikkelnummer': matrikkelnummer,
                    'kommunenummer': kommunenummer,
                    'kommunenavn': kommune['properties']['kommunenavn'] if kommune else None
                }
            }
        }

        features.append(feature)

    return {
        'type': 'FeatureCollection',
        'features': features
    }


async def _map_adresse_response(response: Dict[str, Any], search_str: str) -> Dict[str, Any]:
    adresser: List[Dict[str, Any]] = response['adresser']
    features: List[Dict[str, Any]] = []

    for adresse in adresser:
        repr_punkt: Dict[str, Any] = adresse['representasjonspunkt']
        kommunenummer: str = adresse['kommunenummer']
        kommune = await get_kommune_by_kommunenummer(kommunenummer)
        adressetekst = adresse['adressetekst']

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
                'type': 'Vegadresse',
                'value': adressetekst,
                'data': {
                    'matrikkelnummer': _get_matrikkelnummer(adresse),
                    'adressetekst': adresse['adressetekst'],
                    'kommunenummer': kommunenummer,
                    'kommunenavn': kommune['properties']['kommunenavn'] if kommune else None
                }
            }
        }

        features.append(feature)

    return {
        'type': 'FeatureCollection',
        'features': features
    }


def _get_matrikkelnummer(properties: Dict[str, Any]) -> str:
    matrikkel_nummer = f'{properties["kommunenummer"]}-{properties["gardsnummer"]}/{properties["bruksnummer"]}'
    festenummer = properties['festenummer']

    if festenummer != 0:
        matrikkel_nummer += f'/{festenummer}'

    return matrikkel_nummer


def _create_wfs_request_xml(
    layer: str,
    geom_field: str,
    gml_str: str,
    crs: str
) -> str:
    with _wfs_request_xml_path.open() as file:
        xml_str = file.read()

    return xml_str.format(layer=layer, geom_field=geom_field, geometry=gml_str, crs=crs)


def _gml_from_geojson_str(geojson_str: str) -> str | None:
    try:
        geometry: ogr.Geometry = ogr.CreateGeometryFromJson(geojson_str)

        if not geometry:
            return None

        return geometry.ExportToGML(['FORMAT=GML3'])
    except:
        return None


def _geojson_from_geometry(geometry: ogr.Geometry) -> Dict[str, Any] | None:
    try:
        json_str = geometry.ExportToJson()

        return json.loads(json_str)
    except:
        return None


def _geometry_from_gml(gml_str: str) -> ogr.Geometry | None:
    try:
        return ogr.CreateGeometryFromGML(gml_str)
    except:
        return None


def _get_geojson_str(geometry: Dict[str, Any]) -> str:
    return json.dumps(geometry, sort_keys=True, separators=(',', ':'))


__all__ = ['get_eiendom_from_matrikkel',
           'search_by_matrikkel_no', 'search_by_adresse']
