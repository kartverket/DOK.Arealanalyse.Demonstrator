import json
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict, List
from osgeo import ogr


def add_geojson_crs(geojson: Dict[str, Any], epsg: int | None) -> None:
    if epsg is None:
        return

    geojson['crs'] = {
        'type': 'name',
        'properties': {
            'name': 'urn:ogc:def:crs:EPSG::' + str(epsg)
        }
    }


def get_polygons_from_geometries(geometries: List[ogr.Geometry]) -> List[ogr.Geometry]:
    polygons: List[ogr.Geometry] = []

    for geometry in geometries:
        geom_type = geometry.GetGeometryType()

        if geom_type == ogr.wkbPolygon:
            polygons.append(geometry)
        elif geom_type == ogr.wkbMultiPolygon:
            geom_count = geometry.GetGeometryCount()

            for i in range(geom_count):
                polygons.append(geometry.GetGeometryRef(i))

    return polygons


def is_cache_valid(path: Path, cache_days: int) -> bool:
    if not path.exists():
        return False

    timestamp = path.stat().st_mtime
    modified = datetime.fromtimestamp(timestamp, tz=timezone.utc)
    diff = datetime.now(tz=timezone.utc) - modified

    return diff.days > cache_days


def read_file_from_disk(path: Path) -> Any:
    with path.open() as file:
        return json.loads(file.read())


def write_file_to_disk(path: Path, content: str) -> None:
    with path.open('w') as file:
        file.write(content)


__all__ = ['add_geojson_crs', 'get_polygons_from_geometries',
           'is_cache_valid', 'read_file_from_disk', 'write_file_to_disk']
