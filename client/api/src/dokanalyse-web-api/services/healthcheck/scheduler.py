import time
import asyncio
import logging
from .runner import run_and_store
from . import settings

_logger = logging.getLogger(__name__)
_INITIAL_DELAY_SECONDS = 30


async def run_periodically() -> None:
    interval = settings.INTERVAL_MINUTES * 60
    _logger.info('Healthcheck scheduler started (interval: %d min)', settings.INTERVAL_MINUTES)

    await asyncio.sleep(_INITIAL_DELAY_SECONDS)

    while True:
        start = time.monotonic()

        try:
            summary = await run_and_store('scheduler')

            if summary:
                _logger.info('Healthcheck finished: %d results in %.1f s',
                             len(summary.results), time.monotonic() - start)
        except asyncio.CancelledError:
            raise
        except Exception:
            _logger.exception('Healthcheck failed')

        await asyncio.sleep(max(60, interval - (time.monotonic() - start)))


def start_scheduler() -> asyncio.Task[None] | None:
    if not settings.ENABLED:
        return None

    return asyncio.create_task(run_periodically(), name='healthcheck-scheduler')


__all__ = ['start_scheduler']
