import io
import re
import tarfile
import logging
from pathlib import Path
from dataclasses import dataclass, field
from typing import Any, Dict, List
import yaml
from pydantic import ValidationError
from .http_client import RunContext, HttpResult
from .models import DatasetConfig, InvalidConfig
from . import settings

_logger = logging.getLogger(__name__)

_ARCHIVE_URL = 'https://codeload.github.com/{repo}/tar.gz/{ref}'
_MAX_ARCHIVE_BYTES = 20 * 1024 * 1024
_root_yml_regex = re.compile(r'^[^/]+/(?P<file_name>[^/]+\.yml)$')

_archive: bytes | None = None


@dataclass
class ConfigSource:
    url: str
    ref: str
    source: str
    http_result: HttpResult
    commit: str | None = None
    datasets: List[DatasetConfig] = field(default_factory=list)
    invalid: List[InvalidConfig] = field(default_factory=list)
    disabled_count: int = 0
    error: str | None = None


async def load_configs(context: RunContext, ref: str | None = None) -> ConfigSource:
    global _archive

    ref = ref or settings.CONFIG_REF
    url = _ARCHIVE_URL.format(repo=settings.CONFIG_REPO, ref=ref)
    result = await context.request('GET', url)

    archive: bytes | None = None
    source = 'github'

    if result.ok and result.body and len(result.body) <= _MAX_ARCHIVE_BYTES:
        archive = result.body
        _archive = result.body
    else:
        archive = _archive or _read_fallback()
        source = 'cache'

    if archive is None:
        return ConfigSource(url, ref, 'none', result, error='Kunne ikke hente konfigurasjonsfilene fra GitHub')

    try:
        config_source = _parse_archive(archive, url, ref, source, result)
    except (tarfile.TarError, OSError) as err:
        return ConfigSource(url, ref, 'none', result, error=f'Ugyldig arkiv fra GitHub: {err}')

    if source == 'github':
        _write_fallback(archive)

    return config_source


def _parse_archive(archive: bytes, url: str, ref: str, source: str, result: HttpResult) -> ConfigSource:
    config_source = ConfigSource(url, ref, source, result)

    with tarfile.open(fileobj=io.BytesIO(archive), mode='r:gz') as tar:
        config_source.commit = tar.pax_headers.get('comment')

        for member in sorted(tar.getmembers(), key=lambda member: member.name):
            match = _root_yml_regex.match(member.name)

            if not match or not member.isfile():
                continue

            file = tar.extractfile(member)

            if file is None:
                continue

            file_name = match.group('file_name')

            try:
                text = file.read().decode('utf-8')
            except UnicodeDecodeError:
                config_source.invalid.append(InvalidConfig(
                    file_name=file_name, error='Filen er ikke gyldig UTF-8'))
                continue

            _parse_file(file_name, text, config_source)

    return config_source


def _parse_file(file_name: str, text: str, config_source: ConfigSource) -> None:
    try:
        documents: List[Any] = list(yaml.safe_load_all(text))
    except yaml.YAMLError as err:
        config_source.invalid.append(InvalidConfig(
            file_name=file_name, error=f'Ugyldig YAML: {err}'))
        return

    for document in documents:
        if not isinstance(document, dict) or document.get('type') != 'dataset':
            continue

        if document.get('disabled'):
            config_source.disabled_count += 1
            continue

        _parse_dataset(file_name, document, config_source)


def _parse_dataset(file_name: str, document: Dict[str, Any], config_source: ConfigSource) -> None:
    config_id = document.get('config_id')
    name = document.get('name')

    if not any(key in document for key in ('wfs', 'arcgis', 'ogc_api')):
        config_source.invalid.append(InvalidConfig(
            file_name=file_name, config_id=_to_str(config_id), name=_to_str(name),
            error='Datasettet mangler "wfs", "arcgis" eller "ogc_api"'))
        return

    try:
        config = DatasetConfig.model_validate({**document, 'file_name': file_name})
        config_source.datasets.append(config)
    except ValidationError as err:
        errors = '; '.join(
            f'{".".join(map(str, error["loc"]))}: {error["msg"]}' for error in err.errors())
        config_source.invalid.append(InvalidConfig(
            file_name=file_name, config_id=_to_str(config_id), name=_to_str(name), error=errors))


def _fallback_path() -> Path:
    return Path(settings.DB_PATH).with_suffix('.configs.tar.gz')


def _read_fallback() -> bytes | None:
    try:
        return _fallback_path().read_bytes()
    except FileNotFoundError:
        return None
    except OSError as err:
        _logger.warning('Could not read stored config archive: %s', err)
        return None


def _write_fallback(archive: bytes) -> None:
    try:
        path = _fallback_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(archive)
    except OSError as err:
        _logger.warning('Could not store config archive: %s', err)


def _to_str(value: Any) -> str | None:
    return str(value) if value is not None else None


__all__ = ['ConfigSource', 'load_configs']
