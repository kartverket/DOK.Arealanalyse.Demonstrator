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


__all__ = ['add_geojson_crs', 'get_polygons_from_geometries']
