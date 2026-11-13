from datetime import datetime, timezone
from dataclasses import dataclass
from urllib.parse import urlsplit
from typing import Any, Callable, Dict, List, Literal, Set, Tuple
from ..http_client import RunContext, Assessment, assess, local_name
from ..models import Auth, CheckResult, DatasetConfig, Status, Target
from ..config_source import ConfigSource
from .. import settings

Validator = Callable[[Any], str | None]

_NAP_AUTH = Auth(username='${NAP_USERNAME}', password='${NAP_PASSWORD}')


@dataclass
class Endpoint:
    id: str
    name: str
    group: str
    url: str
    expect: Literal['json', 'xml']
    used_by: List[str]
    params: Dict[str, Any] | None = None
    auth: Auth | None = None
    validate: Validator | None = None


def _non_empty_list(key: str | None = None) -> Validator:
    def validate(data: Any) -> str | None:
        if key is None:
            items = data
        else:
            items = data.get(key) if isinstance(data, dict) else None

        if not isinstance(items, list) or not items:
            return f'Responsen mangler {f"«{key}»" if key else "elementer"}'

        return None

    return validate


def _has_key(key: str) -> Validator:
    def validate(data: Any) -> str | None:
        if not isinstance(data, dict) or data.get(key) in (None, ''):
            return f'Responsen mangler «{key}»'

        return None

    return validate


def _capabilities(data: Any) -> str | None:
    if 'Capabilities' not in local_name(data.tag):
        return 'Responsen er ikke et GetCapabilities-dokument'

    return None


def _xml_schema(data: Any) -> str | None:
    if local_name(data.tag) != 'schema':
        return 'Responsen er ikke et XML-skjema'

    return None


def _wfs_capabilities_endpoint(id: str, name: str, url: str, used_by: List[str]) -> Endpoint:
    return Endpoint(id, name, 'Geonorge', url, 'xml', used_by,
                    params={'service': 'WFS', 'version': '2.0.0', 'request': 'GetCapabilities'},
                    validate=_capabilities)


def get_endpoints(datasets: List[DatasetConfig]) -> List[Endpoint]:
    endpoints = [
        Endpoint('dok-statusregisteret', 'DOK-statusregisteret', 'Geonorge',
                 'https://register.geonorge.no/api/dok-statusregisteret.json', 'json',
                 ['Process', 'API'], validate=_non_empty_list('containeditems')),
        Endpoint('geolett', 'Geolett (veiledningstekster)', 'Geonorge',
                 'https://register.geonorge.no/geolett/api', 'json',
                 ['Process'], validate=_non_empty_list()),
        Endpoint('dok-kommunalt', 'DOK kommunalt (Drammen)', 'Geonorge',
                 'https://register.geonorge.no/api/det-offentlige-kartgrunnlaget-kommunalt.json',
                 'json', ['Process'], params={'municipality': '3301'}),
        Endpoint('kodeliste-arealressurs', 'Kodeliste: AR5 arealtype', 'Geonorge',
                 'https://register.geonorge.no/api/sosi-kodelister/fkb/ar5/5.0/arealressursarealtype.json',
                 'json', ['Process'], validate=_non_empty_list('containeditems')),
        Endpoint('kodeliste-dekningsstatus', 'Kodeliste: dekningsstatus', 'Geonorge',
                 'https://register.geonorge.no/api/sosi-kodelister/temadata/fullstendighetsdekningskart/dekningsstatus.json',
                 'json', ['Process'], validate=_non_empty_list('containeditems')),
        Endpoint('kodeliste-vegkategori', 'Kodeliste: vegkategori', 'Geonorge',
                 'https://register.geonorge.no/api/sosi-kodelister/kartdata/vegkategori.json',
                 'json', ['Process'], validate=_non_empty_list('containeditems')),
        _wfs_capabilities_endpoint('wfs-administrative-enheter', 'WFS administrative enheter',
                                   'https://wfs.geonorge.no/skwms1/wfs.administrative_enheter', ['Process']),
        _wfs_capabilities_endpoint('wfs-bygningspunkt', 'WFS Matrikkelen bygningspunkt',
                                   'https://wfs.geonorge.no/skwms1/wfs.matrikkelen-bygningspunkt', ['Process']),
        _wfs_capabilities_endpoint('wfs-eiendomskart-teig', 'WFS Matrikkelen eiendomskart teig',
                                   'https://wfs.geonorge.no/skwms1/wfs.matrikkelen-eiendomskart-teig', ['API']),
        Endpoint('wmts-cache', 'WMTS bakgrunnskart (cache.kartverket.no)', 'Kartverket',
                 'https://cache.kartverket.no/v1/wmts/1.0.0/WMTSCapabilities.xml', 'xml',
                 ['Process', 'Front-end'], params={'request': 'GetCapabilities'}, validate=_capabilities),
        Endpoint('kommuneinfo-punkt', 'Kommuneinfo: kommune for punkt', 'Kartverket',
                 'https://api.kartverket.no/kommuneinfo/v1/punkt', 'json', ['Process', 'API'],
                 params={'nord': 6632750, 'ost': 230250, 'koordsys': settings.TEST_EPSG,
                         'filtrer': 'kommunenummer'},
                 validate=_has_key('kommunenummer')),
        Endpoint('kommuneinfo-fylkerkommuner', 'Kommuneinfo: fylker og kommuner', 'Kartverket',
                 'https://api.kartverket.no/kommuneinfo/v1/fylkerkommuner', 'json', ['API'],
                 params={'filtrer': 'fylkesnummer'}, validate=_non_empty_list()),
        Endpoint('adresser', 'Adresse-API', 'Kartverket',
                 'https://ws.geonorge.no/adresser/v1/sok', 'json', ['API'],
                 params={'sok': 'Bragernes torg', 'treffPerSide': 1}, validate=_has_key('adresser')),
        Endpoint('eiendom-geokoding', 'Eiendom-API: geokoding', 'Kartverket',
                 'https://api.kartverket.no/eiendom/v1/geokoding', 'json', ['API'],
                 params={'kommunenummer': '3301', 'gardsnummer': 1, 'bruksnummer': 1,
                         'omrade': 'false', 'utkoordsys': 4326}),
        Endpoint('nap-reguleringsplaner', 'NAP reguleringsplaner', 'DiBK',
                 'https://nap.ft.dibk.no/services/rest/reguleringsplaner/vn2/collections/rpomrade/items',
                 'json', ['API'], params={'f': 'json', 'limit': 1}, auth=_NAP_AUTH,
                 validate=_has_key('features')),
        Endpoint('nap-reguleringsplanforslag', 'NAP reguleringsplanforslag', 'DiBK',
                 'https://nap.ft.dibk.no/services/rest/reguleringsplanforslag/vn2/collections/rpomrade/items',
                 'json', ['API'], params={'f': 'json', 'limit': 1}, auth=_NAP_AUTH,
                 validate=_has_key('features')),
        Endpoint('gml-schema', 'GML 3.2.1-skjema', 'OGC',
                 'https://schemas.opengis.net/gml/3.2.1/gml.xsd', 'xml', ['Process'],
                 validate=_xml_schema)
    ]

    metadata_id = next((str(dataset.metadata_id) for dataset in datasets if dataset.metadata_id), None)

    if metadata_id:
        endpoints.append(Endpoint('kartkatalog', 'Kartkatalogen', 'Geonorge',
                                  f'https://kartkatalog.geonorge.no/api/getdata/{metadata_id}', 'json',
                                  ['Process'], validate=_has_key('NorwegianTitle')))

    if settings.PYGEOAPI_API_URL:
        process_url = f'{settings.PYGEOAPI_API_URL.rstrip("/")}/processes/dokanalyse'
        endpoints.append(Endpoint('pygeoapi', 'DOK-analyse (pygeoapi-prosess)', 'Intern',
                                  process_url, 'json', ['API'], params={'f': 'json'},
                                  validate=_has_key('id')))

    return endpoints


async def check_endpoint(context: RunContext, endpoint: Endpoint) -> Tuple[CheckResult, Any]:
    result = await context.request('GET', endpoint.url, params=endpoint.params, auth=endpoint.auth)
    assessment = assess(result, endpoint.expect)

    if assessment.parsed is not None and endpoint.validate:
        error = endpoint.validate(assessment.parsed)

        if error:
            assessment = Assessment(Status.DOWN, error)

    check_result = CheckResult(
        target=_create_target(endpoint),
        status=assessment.status,
        http_status=result.status,
        response_ms=result.response_ms,
        message=assessment.message,
        checked_at=datetime.now(timezone.utc)
    )

    return check_result, assessment.parsed


def get_geolett_ids(data: Any) -> Set[str] | None:
    if not isinstance(data, list):
        return None

    return {str(item.get('id')) for item in data if isinstance(item, dict)}


def create_config_source_result(config_source: ConfigSource) -> CheckResult:
    result = config_source.http_result
    status = Status.OK
    message = None

    if config_source.error:
        status, message = Status.DOWN, config_source.error
    elif config_source.source == 'cache':
        status = Status.DEGRADED
        message = f'Bruker sist hentede konfigurasjon ({result.error or f"HTTP {result.status}"})'

    return CheckResult(
        target=Target(
            id='endpoint-config-repo',
            kind='endpoint',
            name=f'Konfigurasjon (GitHub {settings.CONFIG_REPO}@{config_source.ref})',
            service_type='http',
            url=config_source.url,
            meta={'group': 'Intern', 'host': urlsplit(config_source.url).hostname, 'used_by': ['Helsesjekk']}
        ),
        status=status,
        http_status=result.status,
        response_ms=result.response_ms,
        message=message,
        details={
            'commit': config_source.commit,
            'datasets': len(config_source.datasets),
            'disabled': config_source.disabled_count,
            'invalid': len(config_source.invalid)
        },
        checked_at=datetime.now(timezone.utc)
    )


def _create_target(endpoint: Endpoint) -> Target:
    return Target(
        id=f'endpoint-{endpoint.id}',
        kind='endpoint',
        name=endpoint.name,
        service_type='http',
        url=endpoint.url,
        meta={
            'group': endpoint.group,
            'host': urlsplit(endpoint.url).hostname,
            'used_by': endpoint.used_by
        }
    )


__all__ = ['Endpoint', 'get_endpoints', 'check_endpoint',
           'get_geolett_ids', 'create_config_source_result']
