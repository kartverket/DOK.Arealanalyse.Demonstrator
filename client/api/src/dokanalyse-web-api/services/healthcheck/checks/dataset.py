import json
import asyncio
from urllib.parse import quote
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Set, Tuple, cast
from ..http_client import RunContext, assess, parse_json
from ..models import (Auth, CheckResult, DatasetConfig, InvalidConfig, LayerConfig,
                      Status, Target, worst_status)
from ..schema import get_filter_fields, get_json_paths, get_missing, get_xsd_feature_paths
from .services import ServiceInfo, get_service_info, get_url_and_auth
from .. import settings

_KARTKATALOG_URL = 'https://kartkatalog.geonorge.no/api/getdata'
_SERVICE_NAMES = {'wfs': 'WFS', 'arcgis': 'ArcGIS REST', 'ogc_api': 'OGC API'}

_WFS_REQUEST_XML = '''<wfs:GetFeature service="WFS" version="2.0.0"
   xmlns:wfs="http://www.opengis.net/wfs/2.0"
   xmlns:fes="http://www.opengis.net/fes/2.0"
   xmlns:gml="http://www.opengis.net/gml/3.2"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
   <wfs:Query typeNames="{layer}" srsName="urn:ogc:def:crs:EPSG::{epsg}">
      <fes:Filter>
         <fes:Intersects>
            <fes:ValueReference>{geom_field}</fes:ValueReference>
            {geometry}
         </fes:Intersects>
      </fes:Filter>
   </wfs:Query>
</wfs:GetFeature>'''


@dataclass
class QueryReport:
    status: Status
    http_status: int | None
    response_ms: int
    hit_count: int | None = None
    message: str | None = None


@dataclass
class LayerReport:
    name: str | None
    exists: bool | None = None
    schema_verified: bool = False
    schema_note: str | None = None
    missing_properties: List[str] = field(default_factory=list)
    missing_filter_fields: List[str] = field(default_factory=list)
    geom_field_missing: bool = False
    missing_wms_layers: List[str] = field(default_factory=list)
    query: QueryReport | None = None
    status: Status = Status.OK
    issues: List[str] = field(default_factory=list)


async def check_dataset(context: RunContext, config: DatasetConfig, geolett_ids: Set[str] | None) -> CheckResult:
    service_type = cast(str, config.service_type)
    url, auth = get_url_and_auth(config.feature_service)  # type: ignore[arg-type]
    service_name = _SERVICE_NAMES[service_type]

    service, wms, metadata = await asyncio.gather(
        get_service_info(context, service_type, url, auth),  # type: ignore[arg-type]
        _get_wms_info(context, config),
        _check_metadata(context, config)
    )

    service.datasets.append(config.name)

    if wms:
        wms.datasets.append(config.name)

    issues: List[str] = []
    statuses: List[Status] = []
    layers: List[LayerReport] = []

    if service.is_down:
        statuses.append(Status.DOWN)
        issues.append(f'{service_name}-tjenesten svarer ikke: {service.assessment.message}')
    else:
        if service.assessment.status == Status.SLOW:
            statuses.append(Status.SLOW)

        layers = list(await asyncio.gather(*[
            _check_layer(context, config, layer, service, url, auth) for layer in config.layers
        ]))

        for report in layers:
            statuses.append(report.status)
            issues.extend(report.issues)

    if wms is not None:
        if wms.is_down:
            statuses.append(Status.DEGRADED)
            issues.append(f'WMS-tjenesten svarer ikke: {wms.assessment.message}')
        elif wms.layers is not None:
            for layer, report in _zip_layers(config.layers, layers):
                report.missing_wms_layers = [name for name in layer.wms if name not in wms.layers]

                if report.missing_wms_layers:
                    statuses.append(Status.DEGRADED)
                    issues.append(f'WMS-lag finnes ikke: {", ".join(report.missing_wms_layers)}')

    missing_guidance = _get_missing_guidance_ids(config.layers, geolett_ids)

    if missing_guidance:
        statuses.append(Status.DEGRADED)
        issues.append(f'Veiledningstekst finnes ikke i Geolett: {", ".join(missing_guidance)}')

    if metadata is not None and metadata.get('found') is False:
        statuses.append(Status.DEGRADED)
        issues.append(f'Fant ikke metadata {config.metadata_id} i Kartkatalogen')

    queries = [report.query for report in layers if report.query is not None]
    failed = next((query for query in queries if query.status == Status.DOWN), None)
    primary_query = failed or (queries[0] if queries else None)
    response_ms = max((query.response_ms for query in queries),
                      default=service.http_result.response_ms)

    target = create_dataset_target(config, service_type, url)

    if metadata and metadata.get('title'):
        target.meta['title'] = metadata['title']

    return CheckResult(
        target=target,
        status=worst_status(*statuses),
        http_status=primary_query.http_status if primary_query else service.http_result.status,
        response_ms=response_ms,
        message=issues[0] if issues else None,
        details={
            'issues': issues,
            'feature_service': _service_details(service),
            'wms': _service_details(wms) if wms else None,
            'layers': [_layer_details(report) for report in layers],
            'missing_guidance_ids': missing_guidance,
            'metadata': metadata
        },
        checked_at=datetime.now(timezone.utc)
    )


def create_dataset_target(config: DatasetConfig, service_type: str | None, url: str | None) -> Target:
    return Target(
        id=f'dataset-{config.config_id}',
        kind='dataset',
        name=config.title or config.name,
        service_type=service_type,  # type: ignore[arg-type]
        url=url,
        meta={
            'config_id': str(config.config_id),
            'dataset_name': config.name,
            'file_name': config.file_name,
            'metadata_id': str(config.metadata_id) if config.metadata_id else None,
            'themes': config.themes,
            'wms_url': str(config.wms) if config.wms else None
        }
    )


def create_failed_dataset_result(config: DatasetConfig, message: str) -> CheckResult:
    url = get_url_and_auth(config.feature_service)[0] if config.feature_service else None

    return CheckResult(
        target=create_dataset_target(config, config.service_type, url),
        status=Status.DOWN,
        message=message,
        details={'issues': [message]},
        checked_at=datetime.now(timezone.utc)
    )


def create_invalid_config_result(config: InvalidConfig) -> CheckResult:
    return CheckResult(
        target=Target(
            id=f'dataset-{config.config_id or config.file_name}',
            kind='dataset',
            name=config.name or config.file_name,
            meta={'config_id': config.config_id, 'file_name': config.file_name}
        ),
        status=Status.DOWN,
        message=f'Ugyldig konfigurasjon: {config.error}',
        details={'issues': [f'Ugyldig konfigurasjon: {config.error}']},
        checked_at=datetime.now(timezone.utc)
    )


async def _check_layer(
    context: RunContext,
    config: DatasetConfig,
    layer: LayerConfig,
    service: ServiceInfo,
    url: str,
    auth: Auth | None
) -> LayerReport:
    service_type = cast(str, config.service_type)
    name: str | None = getattr(layer, service_type)
    report = LayerReport(name=name)

    if not name:
        report.status = Status.DOWN
        report.issues.append(f'Laget mangler "{service_type}"')
        return report

    report.exists = name in service.layers if service.layers is not None else None

    if report.exists is False:
        report.status = Status.DOWN
        report.issues.append(f'Laget «{name}» finnes ikke i tjenesten')
        return report

    match service_type:
        case 'wfs':
            qualified = service.qualified_names.get(name, name)
            (paths, note), query = await asyncio.gather(
                _get_wfs_paths(context, url, auth, qualified),
                _query_wfs(context, config, name, url, auth))
        case 'arcgis':
            (paths, note), query = await asyncio.gather(
                _get_arcgis_fields(context, url, auth, name),
                _query_arcgis(context, layer, name, url, auth))
        case _:
            (paths, note), query = await asyncio.gather(
                _get_ogc_api_paths(context, url, auth, name),
                _query_ogc_api(context, config, layer, name, url, auth))

    report.query = query
    report.schema_note = note
    statuses = [query.status]

    if query.status == Status.DOWN:
        report.issues.append(f'Spørring mot «{name}» feilet: {query.message}')
    elif query.status == Status.SLOW:
        report.issues.append(f'Spørring mot «{name}» er treg ({query.response_ms} ms)')

    if paths is not None:
        report.schema_verified = True
        properties = config.properties if isinstance(config.properties, list) else []
        report.missing_properties = get_missing(properties, paths)
        report.missing_filter_fields = get_missing(get_filter_fields(layer.filter), paths)
        report.geom_field_missing = (service_type == 'wfs' and bool(config.geom_field)
                                     and config.geom_field not in paths)

        if report.missing_properties:
            statuses.append(Status.DEGRADED)
            report.issues.append(f'Egenskaper finnes ikke i «{name}»: {", ".join(report.missing_properties)}')

        if report.missing_filter_fields:
            statuses.append(Status.DEGRADED)
            report.issues.append(f'Filterfelt finnes ikke i «{name}»: {", ".join(report.missing_filter_fields)}')

        if report.geom_field_missing:
            statuses.append(Status.DEGRADED)
            report.issues.append(f'Geometrifeltet «{config.geom_field}» finnes ikke i «{name}»')

    report.status = worst_status(*statuses)

    return report


async def _get_wfs_paths(context: RunContext, url: str, auth: Auth | None, type_name: str) -> Tuple[Set[str] | None, str | None]:
    params = {'service': 'WFS', 'version': '2.0.0',
              'request': 'DescribeFeatureType', 'typeNames': type_name}
    result = await context.request('GET', url, params=params, auth=auth)
    assessment = assess(result, 'xml')

    if assessment.parsed is None:
        return None, f'Kunne ikke hente skjema (DescribeFeatureType): {assessment.message}'

    paths = get_xsd_feature_paths(assessment.parsed, type_name)

    if paths is None:
        return None, 'Fant ikke objekttypen i skjemaet (DescribeFeatureType)'

    return paths, None


async def _get_arcgis_fields(context: RunContext, url: str, auth: Auth | None, layer: str) -> Tuple[Set[str] | None, str | None]:
    result = await context.request('GET', f'{url}/{layer}', params={'f': 'json'}, auth=auth)
    assessment = assess(result, 'json')
    parsed = assessment.parsed

    if not isinstance(parsed, dict) or not isinstance(parsed.get('fields'), list):
        return None, f'Kunne ikke hente feltene til laget: {assessment.message or "mangler «fields»"}'

    return {str(field.get('name')) for field in parsed['fields'] if isinstance(field, dict)}, None


async def _get_ogc_api_paths(context: RunContext, url: str, auth: Auth | None, collection: str) -> Tuple[Set[str] | None, str | None]:
    result = await context.request('GET', f'{url}/collections/{collection}/items',
                                   params={'f': 'json', 'limit': 1}, auth=auth)
    assessment = assess(result, 'json')
    parsed = assessment.parsed

    if not isinstance(parsed, dict) or not isinstance(parsed.get('features'), list):
        return None, f'Kunne ikke hente et eksempelobjekt: {assessment.message or "mangler «features»"}'

    if not parsed['features']:
        return None, 'Samlingen har ingen objekter å kontrollere egenskapene mot'

    feature = parsed['features'][0]
    properties = (feature.get('properties') or {}) if isinstance(feature, dict) else None

    if not isinstance(properties, dict):
        return None, 'Eksempelobjektet er ikke et gyldig GeoJSON-objekt'

    return get_json_paths(properties), None


async def _query_wfs(context: RunContext, config: DatasetConfig, layer: str, url: str, auth: Auth | None) -> QueryReport:
    xml = _WFS_REQUEST_XML.format(
        layer=layer, geom_field=config.geom_field, geometry=_to_gml(), epsg=settings.TEST_EPSG)
    result = await context.request('POST', url, params={'service': 'WFS', 'version': '2.0.0'},
                                   data=xml.encode('utf-8'), auth=auth)
    assessment = assess(result, 'xml')
    report = _create_query_report(result.status, result.response_ms, assessment.status, assessment.message)
    root = assessment.parsed

    if root is None:
        return report

    if not root.tag.endswith('FeatureCollection'):
        return _failed(report, 'Responsen er ikke en FeatureCollection')

    number_returned = root.get('numberReturned')
    report.hit_count = int(number_returned) if number_returned and number_returned.isdigit() \
        else sum(1 for _ in root.iter(f'{{*}}{layer}'))

    return report


async def _query_arcgis(context: RunContext, layer: LayerConfig, name: str, url: str, auth: Auth | None) -> QueryReport:
    data = {
        'geometry': _to_arcgis_geometry(),
        'geometryType': 'esriGeometryPolygon',
        'spatialRel': 'esriSpatialRelIntersects',
        'where': layer.filter if layer.filter is not None else '1=1',
        'inSR': settings.TEST_EPSG,
        'outSR': settings.TEST_EPSG,
        'units': 'esriSRUnit_Meter',
        'outFields': '*',
        'returnGeometry': 'true',
        'f': 'geojson'
    }

    result = await context.request('POST', f'{url}/{name}/query', data=data, auth=auth)
    assessment = assess(result, 'json')
    report = _create_query_report(result.status, result.response_ms, assessment.status, assessment.message)
    parsed = assessment.parsed

    if parsed is None:
        return report

    if not isinstance(parsed, dict) or not isinstance(parsed.get('features'), list):
        return _failed(report, 'Responsen mangler «features»')

    report.hit_count = len(parsed['features'])

    return report


async def _query_ogc_api(
    context: RunContext,
    config: DatasetConfig,
    layer: LayerConfig,
    name: str,
    url: str,
    auth: Auth | None
) -> QueryReport:
    epsg = settings.TEST_EPSG
    crs = f'http://www.opengis.net/def/crs/EPSG/0/{epsg}'
    request_url = (f'{url}/collections/{name}/items?f=json&limit=5000&filter-lang=cql2-text'
                   f'&filter-crs={crs}&crs={crs}'
                   f'&filter=S_INTERSECTS({config.geom_field},{_to_wkt()})')

    if layer.filter:
        request_url += f' AND {layer.filter}'

    result = await context.request('GET', quote(request_url, safe=':/?&='), auth=auth)
    assessment = assess(result, 'json')
    report = _create_query_report(result.status, result.response_ms, assessment.status, assessment.message)
    parsed = assessment.parsed

    if parsed is None:
        return report

    if not isinstance(parsed, dict) or not isinstance(parsed.get('features'), list):
        return _failed(report, 'Responsen mangler «features»')

    report.hit_count = len(parsed['features'])

    return report


async def _get_wms_info(context: RunContext, config: DatasetConfig) -> ServiceInfo | None:
    if not config.wms:
        return None

    return await get_service_info(context, 'wms', str(config.wms).rstrip('/'), None)


async def _check_metadata(context: RunContext, config: DatasetConfig) -> Dict[str, Any] | None:
    if not config.metadata_id:
        return None

    result = await context.request('GET', f'{_KARTKATALOG_URL}/{config.metadata_id}')

    if result.status == 404:
        return {'found': False}

    if not result.ok:
        return {'found': None, 'message': result.error or f'HTTP {result.status}'}

    data = parse_json(result.body)
    title = data.get('NorwegianTitle') if isinstance(data, dict) else None

    return {'found': bool(title), 'title': title}


def _get_missing_guidance_ids(layers: List[LayerConfig], geolett_ids: Set[str] | None) -> List[str]:
    if geolett_ids is None:
        return []

    missing: List[str] = []

    for layer in layers:
        for guidance_id in (layer.planning_guidance_id, layer.building_guidance_id):
            if guidance_id and str(guidance_id) not in geolett_ids and str(guidance_id) not in missing:
                missing.append(str(guidance_id))

    return missing


def _zip_layers(configs: List[LayerConfig], reports: List[LayerReport]) -> List[Tuple[LayerConfig, LayerReport]]:
    if len(reports) != len(configs):
        reports = [LayerReport(name=None) for _ in configs]

    return list(zip(configs, reports))


def _create_query_report(http_status: int | None, response_ms: int, status: Status, message: str | None) -> QueryReport:
    return QueryReport(status=status, http_status=http_status, response_ms=response_ms, message=message)


def _failed(report: QueryReport, message: str) -> QueryReport:
    report.status = Status.DOWN
    report.message = message

    return report


def _service_details(info: ServiceInfo) -> Dict[str, Any]:
    return {
        'target_id': info.target.id,
        'url': info.target.url,
        'status': info.assessment.status,
        'http_status': info.http_result.status,
        'response_ms': info.http_result.response_ms,
        'message': info.assessment.message
    }


def _layer_details(report: LayerReport) -> Dict[str, Any]:
    details = asdict(report)
    details.pop('issues')

    return details


def _test_ring() -> List[Tuple[float, float]]:
    min_x, min_y, max_x, max_y = settings.TEST_BBOX

    return [(min_x, min_y), (max_x, min_y), (max_x, max_y), (min_x, max_y), (min_x, min_y)]


def _to_gml() -> str:
    pos_list = ' '.join(f'{x:.2f} {y:.2f}' for x, y in _test_ring())

    return (f'<gml:Polygon srsName="urn:ogc:def:crs:EPSG::{settings.TEST_EPSG}">'
            f'<gml:exterior><gml:LinearRing><gml:posList>{pos_list}</gml:posList>'
            f'</gml:LinearRing></gml:exterior></gml:Polygon>')


def _to_arcgis_geometry() -> str:
    return json.dumps({
        'rings': [[[x, y] for x, y in _test_ring()]],
        'spatialReference': {'wkid': settings.TEST_EPSG}
    })


def _to_wkt() -> str:
    coords = ', '.join(f'{x:.2f} {y:.2f}' for x, y in _test_ring())

    return f'POLYGON (({coords}))'


__all__ = ['check_dataset', 'create_dataset_target', 'create_failed_dataset_result',
           'create_invalid_config_result']
