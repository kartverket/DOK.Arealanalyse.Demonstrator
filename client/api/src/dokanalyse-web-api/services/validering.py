import json
from os import getenv
from typing import Any, Dict
from osgeo import ogr
from ..utils.helpers import format_no


def valider(geometry: Dict[str, Any]) -> Dict[str, Any]:
    ogr_geometry = _geojson_to_geometry(geometry)

    if not ogr_geometry or not ogr_geometry.IsValid():
        return {
            'valid': False,
            'message': 'Analyseområdet er ugyldig'
        }

    max_size = _get_area_max_size()

    if max_size:
        area = ogr_geometry.GetArea()

        if area > max_size:
            return {
                'valid': False,
                'message': f'Analyseområdet er større enn {format_no(max_size)} m²'
            }

    return {
        'valid': True,
        'message': None
    }


def _geojson_to_geometry(geojson: Dict[str, Any]) -> ogr.Geometry | None:
    try:
        return ogr.CreateGeometryFromJson(json.dumps(geojson))
    except:
        return None


def _get_area_max_size() -> int | None:
    env_str = getenv('AREA_MAX_SIZE')

    return int(env_str) if env_str else None
