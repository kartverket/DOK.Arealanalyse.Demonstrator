import hashlib
from datetime import datetime, timezone
from dataclasses import dataclass, field
from urllib.parse import urlsplit
from typing import Any, Dict, List, Set
from pydantic import HttpUrl
from ..http_client import RunContext, HttpResult, Assessment, assess, local_name
from ..models import Auth, CheckResult, FeatureService, ServiceType, Status, Target

_SERVICE_NAMES: Dict[str, str] = {
    'wfs': 'WFS',
    'arcgis': 'ArcGIS REST',
    'ogc_api': 'OGC API Features',
    'wms': 'WMS'
}


@dataclass
class ServiceInfo:
    target: Target
    http_result: HttpResult
    assessment: Assessment
    checked_at: datetime
    layers: Set[str] | None = None
    qualified_names: Dict[str, str] = field(default_factory=dict)
    datasets: List[str] = field(default_factory=list)

    @property
    def is_down(self) -> bool:
        return self.assessment.status == Status.DOWN

    def to_result(self) -> CheckResult:
        details: Dict[str, Any] = {'datasets': sorted(set(self.datasets))}

        if self.layers is not None:
            details['layer_count'] = len(self.layers)

        return CheckResult(
            target=self.target,
            status=self.assessment.status,
            http_status=self.http_result.status,
            response_ms=self.http_result.response_ms,
            message=self.assessment.message,
            details=details,
            checked_at=self.checked_at
        )


def get_url_and_auth(service: HttpUrl | FeatureService) -> tuple[str, Auth | None]:
    if isinstance(service, FeatureService):
        return str(service.url).rstrip('/'), service.auth

    return str(service).rstrip('/'), None


def create_service_target(service_type: ServiceType, url: str) -> Target:
    parts = urlsplit(url)
    digest = hashlib.sha1(f'{service_type}:{url}'.encode('utf-8')).hexdigest()[:10]

    return Target(
        id=f'{service_type}-{digest}',
        kind='service',
        name=f'{parts.hostname}{parts.path}',
        service_type=service_type,
        url=url,
        meta={
            'host': parts.hostname,
            'service_name': _SERVICE_NAMES.get(service_type, service_type)
        }
    )


async def get_service_info(
    context: RunContext,
    service_type: ServiceType,
    url: str,
    auth: Auth | None
) -> ServiceInfo:
    async def check() -> ServiceInfo:
        match service_type:
            case 'wfs':
                return await _check_wfs(context, url, auth)
            case 'arcgis':
                return await _check_arcgis(context, url, auth)
            case 'ogc_api':
                return await _check_ogc_api(context, url, auth)
            case 'wms':
                return await _check_wms(context, url)
            case _:
                raise ValueError(f'Unknown service type: {service_type}')

    return await context.memo(f'service:{service_type}:{url}', check)


async def _check_wfs(context: RunContext, url: str, auth: Auth | None) -> ServiceInfo:
    params = {'service': 'WFS', 'version': '2.0.0', 'request': 'GetCapabilities'}
    result = await context.request('GET', url, params=params, auth=auth)
    info = _create_info('wfs', url, result, assess(result, 'xml'))

    if info.assessment.parsed is None:
        return info

    root = info.assessment.parsed

    if 'Capabilities' not in local_name(root.tag):
        return _unexpected(info, 'Responsen er ikke et WFS GetCapabilities-dokument')

    info.layers = set()

    for feature_type in root.iter('{*}FeatureType'):
        name_elem = feature_type.find('{*}Name')

        if name_elem is not None and name_elem.text:
            qualified = name_elem.text.strip()
            name = local_name(qualified)
            info.layers.add(name)
            info.qualified_names[name] = qualified

    return info


async def _check_arcgis(context: RunContext, url: str, auth: Auth | None) -> ServiceInfo:
    result = await context.request('GET', url, params={'f': 'json'}, auth=auth)
    info = _create_info('arcgis', url, result, assess(result, 'json'))
    parsed = info.assessment.parsed

    if parsed is None:
        return info

    if not isinstance(parsed, dict) or not isinstance(parsed.get('layers'), list):
        return _unexpected(info, 'Responsen mangler "layers"')

    tables = parsed.get('tables')
    items = parsed['layers'] + (tables if isinstance(tables, list) else [])
    info.layers = {str(item.get('id')) for item in items if isinstance(item, dict)}

    return info


async def _check_ogc_api(context: RunContext, url: str, auth: Auth | None) -> ServiceInfo:
    result = await context.request('GET', f'{url}/collections', params={'f': 'json'}, auth=auth)
    info = _create_info('ogc_api', url, result, assess(result, 'json'))
    parsed = info.assessment.parsed

    if parsed is None:
        return info

    if not isinstance(parsed, dict) or not isinstance(parsed.get('collections'), list):
        return _unexpected(info, 'Responsen mangler "collections"')

    info.layers = {
        str(collection.get('id')) for collection in parsed['collections'] if isinstance(collection, dict)
    }

    return info


async def _check_wms(context: RunContext, url: str) -> ServiceInfo:
    params = {'service': 'WMS', 'version': '1.3.0', 'request': 'GetCapabilities'}
    result = await context.request('GET', url, params=params)
    info = _create_info('wms', url, result, assess(result, 'xml'))

    if info.assessment.parsed is None:
        return info

    root = info.assessment.parsed

    if 'Capabilities' not in local_name(root.tag):
        return _unexpected(info, 'Responsen er ikke et WMS GetCapabilities-dokument')

    info.layers = set()

    for layer in root.iter('{*}Layer'):
        name_elem = layer.find('{*}Name')

        if name_elem is not None and name_elem.text:
            info.layers.add(name_elem.text.strip())

    return info


def _create_info(service_type: ServiceType, url: str, result: HttpResult, assessment: Assessment) -> ServiceInfo:
    return ServiceInfo(
        target=create_service_target(service_type, url),
        http_result=result,
        assessment=assessment,
        checked_at=datetime.now(timezone.utc)
    )


def _unexpected(info: ServiceInfo, message: str) -> ServiceInfo:
    info.assessment = Assessment(Status.DOWN, message)

    return info


__all__ = ['ServiceInfo', 'get_url_and_auth',
           'create_service_target', 'get_service_info']
