import json
import asyncio
import logging
from pathlib import Path
from typing import Any, Dict, List, Tuple
import aiohttp
from osgeo import ogr, osr, gdal
from shapely.geometry import shape
from .common import add_geojson_crs, get_polygons_from_geometries
from .exceptions import InvalidDatasetError, InvalidGeometryError, GeometryConversionError
from ..utils.session_registry import get_session

ogr.UseExceptions()
osr.UseExceptions()
gdal.UseExceptions()

HOLE_AREA_MIN_SIZE = 1
WGS_84 = 4326

_ADM_ENHETER_API_URL = 'https://ws.geonorge.no/kommuneinfo/v1/punkt'

_logger = logging.getLogger(__name__)


async def get_omrade(filepath: Path, out_epsg: int | None) -> Dict[str, Any]:
    geometry, geojson_obj, epsg = await asyncio.to_thread(_get_omrade_geometry, filepath, out_epsg)
    adm_enhet = await _get_administrativ_enhet(geometry, epsg)

    return {
        'type': 'Feature',
        'geometry': geojson_obj,
        'properties': {
            'kommunenummer': adm_enhet.get('kommunenummer'),
            'kommunenavn': adm_enhet.get('kommunenavn')
        }
    }


# Synkron og CPU-tung (GDAL); kall den fra en tråd for ikke å blokkere event-loopen
def _get_omrade_geometry(filepath: Path, out_epsg: int | None) -> Tuple[ogr.Geometry, Dict[str, Any], int]:
    geojson_geometry = _handle_geojson_geometry(filepath)

    if geojson_geometry:
        geometry, geojson_obj = geojson_geometry

        return geometry, geojson_obj, _get_epsg_from_geojson(geojson_obj)

    try:
        dataset: gdal.Dataset | None = ogr.Open(str(filepath), 0)
    except RuntimeError:
        dataset = None

    if not dataset:
        raise InvalidDatasetError()

    out_epsg = out_epsg or WGS_84

    try:
        out_geometry = _get_geometry_from_dataset(dataset, out_epsg)
    except InvalidGeometryError:
        raise
    except Exception:
        raise GeometryConversionError()

    _validate(out_geometry)

    options = ['COORDINATE_PRECISION=2'] if out_epsg != WGS_84 else []
    json_str = out_geometry.ExportToJson(options)
    geojson_obj = json.loads(json_str)

    if out_epsg != WGS_84:
        add_geojson_crs(geojson_obj, out_epsg)

    return out_geometry, geojson_obj, out_epsg


def _get_geometry_from_dataset(dataset: gdal.Dataset, out_epsg: int) -> ogr.Geometry:
    geometries: List[ogr.Geometry] = []
    out_proj = _get_proj4_from_epsg(out_epsg)
    layer_count = dataset.GetLayerCount()

    for i in range(layer_count):
        layer: ogr.Layer = dataset.GetLayerByIndex(i)

        if not layer:
            continue

        src_proj = _get_proj4(layer)
        coord_trans: osr.CoordinateTransformation | None = None

        if src_proj and out_proj and src_proj != out_proj:
            coord_trans = _get_coordinate_transformation(src_proj, out_proj)

        geometries.extend(_get_geometries_from_layer(layer, coord_trans))

    if not geometries:
        raise InvalidGeometryError()

    multi_polygon = ogr.Geometry(ogr.wkbMultiPolygon)
    polygons = get_polygons_from_geometries(geometries)

    for polygon in polygons:
        multi_polygon.AddGeometry(polygon)

    union: ogr.Geometry = multi_polygon.UnaryUnion()
    out_geometry = _remove_holes(union)
    out_geometry = _dedupe_consecutive_points(out_geometry)

    return out_geometry


def _handle_geojson_geometry(filepath: Path) -> Tuple[ogr.Geometry, Dict[str, Any]] | None:
    try:
        json_str = filepath.read_text()
    except (OSError, ValueError):
        return None

    if not _is_geojson_geometry(json_str):
        return None

    try:
        geometry: ogr.Geometry = ogr.CreateGeometryFromJson(json_str)
    except:
        raise GeometryConversionError()

    _validate(geometry)

    return geometry, json.loads(json_str)


def _get_epsg_from_geojson(geojson_obj: Dict[str, Any]) -> int:
    # F.eks. «urn:ogc:def:crs:EPSG::25833» eller «EPSG:25833»; uten crs er GeoJSON WGS 84
    name: str | None = geojson_obj.get('crs', {}).get('properties', {}).get('name')

    if name is None:
        return WGS_84

    try:
        return int(name.rsplit(':', 1)[-1])
    except ValueError:
        return WGS_84


def _is_geojson_geometry(json_str: str) -> bool:
    try:
        data: Dict[str, Any] = json.loads(json_str)

        if data['type'] in ['Feature', 'FeatureCollection']:
            return False

        return shape(data).geom_type is not None
    except:
        return False


def _get_geometries_from_layer(
    layer: ogr.Layer,
    coord_trans: osr.CoordinateTransformation | None
) -> List[ogr.Geometry]:
    if layer.GetGeomType() == ogr.wkbNone:
        return []

    geometries: List[ogr.Geometry] = []
    feature: ogr.Feature

    for feature in layer:
        geometry: ogr.Geometry | None = feature.GetGeometryRef()

        if geometry is not None and _is_surface(geometry) and geometry.IsValid():
            geometries.append(_get_geometry(geometry, coord_trans))

    return geometries


def _remove_holes(geometry: ogr.Geometry) -> ogr.Geometry:
    geom_type = geometry.GetGeometryType()

    if geom_type == ogr.wkbMultiPolygon:
        multi_polygon = ogr.Geometry(ogr.wkbMultiPolygon)
        geom_count = geometry.GetGeometryCount()

        for i in range(geom_count):
            polygon: ogr.Geometry = geometry.GetGeometryRef(i)
            out_polygon = _remove_holes_from_polygon(polygon.Clone())

            multi_polygon.AddGeometry(out_polygon)

        return multi_polygon

    return _remove_holes_from_polygon(geometry.Clone())


def _remove_holes_from_polygon(geometry: ogr.Geometry) -> ogr.Geometry:
    geom_count = geometry.GetGeometryCount()

    if geom_count == 1:
        return geometry

    out_polygon = ogr.Geometry(ogr.wkbPolygon)
    exterior: ogr.Geometry = geometry.GetGeometryRef(0)
    out_polygon.AddGeometry(exterior.Clone())

    for i in range(1, geom_count):
        ring: ogr.Geometry = geometry.GetGeometryRef(i)
        area: float = ring.GetArea()

        if area > HOLE_AREA_MIN_SIZE:
            out_polygon.AddGeometry(ring.Clone())

    return out_polygon


def _dedupe_consecutive_points_in_ring(ring: ogr.Geometry) -> ogr.Geometry:
    new_ring = ogr.Geometry(ogr.wkbLinearRing)

    prev = None
    point_count = ring.GetPointCount()

    for i in range(point_count):
        point = ring.GetPoint(i)
        key = (point[0], point[1])

        if key != prev:
            new_ring.AddPoint_2D(point[0], point[1])
            prev = key

    new_ring.CloseRings()

    return new_ring


def _dedupe_consecutive_points_in_polygon(geometry: ogr.Geometry) -> ogr.Geometry:
    if geometry.GetGeometryType() != ogr.wkbPolygon:
        raise TypeError('Expected Polygon')

    out_poly = ogr.Geometry(ogr.wkbPolygon)
    geom_count = geometry.GetGeometryCount()

    for i in range(geom_count):
        ring: ogr.Geometry = geometry.GetGeometryRef(i)
        cleaned_ring = _dedupe_consecutive_points_in_ring(ring)

        if cleaned_ring.GetPointCount() >= 4:
            out_poly.AddGeometry(cleaned_ring)

    return out_poly


def _dedupe_consecutive_points(geometry: ogr.Geometry) -> ogr.Geometry:
    geom_type = geometry.GetGeometryType()

    if geom_type == ogr.wkbPolygon:
        return _dedupe_consecutive_points_in_polygon(geometry)

    if geom_type == ogr.wkbMultiPolygon:
        out = ogr.Geometry(ogr.wkbMultiPolygon)
        geom_count = geometry.GetGeometryCount()

        for i in range(geom_count):
            polygon: ogr.Geometry = geometry.GetGeometryRef(i)

            out.AddGeometry(_dedupe_consecutive_points_in_polygon(polygon))
        return out

    raise TypeError('Expected Polygon or MultiPolygon')


def _get_geometry(orig_geometry: ogr.Geometry, coord_trans: osr.CoordinateTransformation | None) -> ogr.Geometry:
    linear_geometry: ogr.Geometry = orig_geometry.GetLinearGeometry()

    if coord_trans:
        linear_geometry.Transform(coord_trans)

    return linear_geometry


def _is_surface(geometry: ogr.Geometry) -> bool:
    geom_type = geometry.GetGeometryType()

    return geom_type in [ogr.wkbPolygon, ogr.wkbMultiPolygon, ogr.wkbSurface, ogr.wkbMultiSurface]


def _get_coordinate_transformation(src_proj4: str, dest_proj4: str) -> osr.CoordinateTransformation:
    src = osr.SpatialReference()
    src.ImportFromProj4(src_proj4)

    dest = osr.SpatialReference()
    dest.ImportFromProj4(dest_proj4)

    return osr.CoordinateTransformation(src, dest)


def _get_proj4(layer: ogr.Layer) -> str | None:
    sr: osr.SpatialReference = layer.GetSpatialRef()

    if not sr:
        return None

    return sr.ExportToProj4()


def _get_proj4_from_epsg(epsg: int) -> str | None:
    sr = osr.SpatialReference()
    sr.ImportFromEPSG(epsg)

    return sr.ExportToProj4()


def _validate(geometry: ogr.Geometry) -> None:
    geom_type = geometry.GetGeometryType()

    if not geometry.IsValid() or geom_type not in [ogr.wkbPolygon, ogr.wkbMultiPolygon]:
        raise InvalidGeometryError()


async def _get_administrativ_enhet(geometry: ogr.Geometry, epsg: int) -> Dict[str, Any]:
    point: ogr.Geometry = geometry.PointOnSurface()

    params = {
        'nord': point.GetY(),
        'ost': point.GetX(),
        'koordsys': epsg,
        'filtrer': 'kommunenummer,kommunenavn'
    }

    # Området kan ligge utenfor Norge; da returneres det uten kommune i stedet for å feile
    try:
        async with get_session().get(_ADM_ENHETER_API_URL, params=params) as response:
            response.raise_for_status()

            return await response.json()
    except aiohttp.ClientError as err:
        _logger.warning('Kunne ikke hente kommune for området: %s', err)

        return {}


__all__ = ['get_omrade']
