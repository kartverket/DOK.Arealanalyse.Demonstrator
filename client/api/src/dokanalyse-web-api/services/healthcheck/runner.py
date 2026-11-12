import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Set
from .http_client import RunContext, create_session
from .config_source import load_configs
from .models import CheckResult, DatasetConfig, RunSummary
from .checks.dataset import check_dataset, create_failed_dataset_result, create_invalid_config_result
from .checks.endpoints import (check_endpoint, create_config_source_result,
                               get_endpoints, get_geolett_ids)
from .checks.services import ServiceInfo
from . import stats, store

_logger = logging.getLogger(__name__)
_run_lock = asyncio.Lock()


async def run_checks(ref: str | None = None) -> RunSummary:
    started_at = datetime.now(timezone.utc)

    async with create_session() as session:
        context = RunContext(session)
        config_source = await load_configs(context, ref)
        results: List[CheckResult] = [create_config_source_result(config_source)]

        endpoint_checks = await asyncio.gather(*[
            check_endpoint(context, endpoint) for endpoint in get_endpoints(config_source.datasets)
        ])

        geolett_ids = None

        for result, parsed in endpoint_checks:
            results.append(result)

            if result.target.id == 'endpoint-geolett':
                geolett_ids = get_geolett_ids(parsed)

        dataset_results = await asyncio.gather(*[
            _check_dataset(context, config, geolett_ids) for config in config_source.datasets
        ])

        results.extend(dataset_results)
        results.extend(create_invalid_config_result(config)
                       for config in config_source.invalid)
        results.extend(_get_service_results(context))

    return RunSummary(
        started_at=started_at,
        finished_at=datetime.now(timezone.utc),
        config_ref=config_source.ref,
        config_commit=config_source.commit,
        config_source=config_source.source,
        results=results
    )


async def run_and_store(trigger: str, ref: str | None = None) -> RunSummary | None:
    if _run_lock.locked():
        _logger.info('Healthcheck already running, skipping')
        return None

    async with _run_lock:
        summary = await run_checks(ref)
        await asyncio.to_thread(store.save_run, summary, trigger)
        await asyncio.to_thread(store.delete_old_results)
        await asyncio.to_thread(stats.warm_cache)

        return summary


async def _check_dataset(context: RunContext, config: DatasetConfig, geolett_ids: Set[str] | None) -> CheckResult:
    # Et uventet svar fra én tjeneste skal ikke stoppe hele kjøringen
    try:
        return await check_dataset(context, config, geolett_ids)
    except Exception:
        _logger.exception('Healthcheck of dataset %s failed', config.file_name)
        return create_failed_dataset_result(config, 'Uventet feil under sjekken av datasettet')


def _get_service_results(context: RunContext) -> List[CheckResult]:
    services: Dict[str, ServiceInfo] = {}

    for info in context.memoized_values():
        if isinstance(info, ServiceInfo):
            services[info.target.id] = info

    return [info.to_result() for info in services.values()]


__all__ = ['run_checks', 'run_and_store']
