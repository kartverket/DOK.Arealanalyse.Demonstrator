import aiohttp
import asyncio
from osgeo import ogr
from ..helpers.geometry import geometry_to_arcgis_geom


async def query_arcgis(url: str, layer: str, filter: str, geometry: ogr.Geometry, epsg: int, timeout: int = 20) -> tuple[int, dict]:
    api_url = f'{url}/{layer}/query'
    arcgis_geom = geometry_to_arcgis_geom(geometry, epsg)

    data = {
        'geometry': arcgis_geom,
        'geometryType': 'esriGeometryPolygon',
        'spatialRel': 'esriSpatialRelIntersects',
        'where': filter if filter is not None else '1=1',
        'inSR': epsg,
        'outSR': epsg,
        'units': 'esriSRUnit_Meter',
        'outFields': '*',
        'returnGeometry': True,
        'f': 'geojson'
    }

    return await __query_arcgis(api_url, data, timeout)


async def __query_arcgis(url: str, data: dict, timeout: int) -> tuple[int, dict]:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, data=data, timeout=timeout) as response:
                if response.status != 200:
                    return response.status, None

                json = await response.json()

                if 'error' in json:
                    return 400, None

                return 200, json
    except asyncio.TimeoutError:
        return 408, None
    except:
        return 500, None
