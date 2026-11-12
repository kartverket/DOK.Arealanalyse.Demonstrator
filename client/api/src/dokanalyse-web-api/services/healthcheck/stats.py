import functools
import threading
import statistics
from zoneinfo import ZoneInfo
from collections import OrderedDict, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, List, Literal, TypeVar
from . import store, settings

Resolution = Literal['hour', 'day']

_tz = ZoneInfo(settings.TIMEZONE)
_problem_statuses = ('degraded', 'down')
_CACHE_SIZE = 64
_DEFAULT_DAYS = 30

_cache: OrderedDict[tuple, Any] = OrderedDict()
_cache_lock = threading.Lock()

F = TypeVar('F', bound=Callable[..., Any])


def _cached(func: F) -> F:
    # Resultatene endres bare når en ny kjøring lagres, så nøkkelen inkluderer siste kjørings-id
    @functools.wraps(func)
    def wrapper(*args: Any) -> Any:
        key = (func.__name__, args, store.get_latest_run_id())

        with _cache_lock:
            if key in _cache:
                _cache.move_to_end(key)
                return _cache[key]

        value = func(*args)

        with _cache_lock:
            _cache[key] = value

            while len(_cache) > _CACHE_SIZE:
                _cache.popitem(last=False)

        return value

    return wrapper  # type: ignore[return-value]


def warm_cache() -> None:
    # Argumentene må samsvare med kallene i routers/status.py for å treffe cachen
    get_statistics(_DEFAULT_DAYS, False)
    get_timeline(_DEFAULT_DAYS, 'day', None, False)
    get_incidents(_DEFAULT_DAYS, None, 1, False)
    get_incidents(_DEFAULT_DAYS, 'dataset', 500, False)


def get_overview() -> Dict[str, Any]:
    run = store.get_latest_run()

    if run is None:
        return {'run': None, 'summary': {}, 'results': []}

    results = store.get_latest_results(run['id'])
    summary: Dict[str, Dict[str, int]] = defaultdict(
        lambda: {'total': 0, 'ok': 0, 'slow': 0, 'degraded': 0, 'down': 0})

    for result in results:
        counts = summary[result['target']['kind']]
        counts['total'] += 1
        counts[result['status']] += 1

    return {'run': run, 'summary': summary, 'results': results}


@_cached
def get_statistics(days: int, include_inactive: bool = False) -> List[Dict[str, Any]]:
    since = _since(days)
    response_times: Dict[str, List[int]] = defaultdict(list)

    for row in store.get_response_times(since, include_inactive):
        response_times[row['target_id']].append(row['response_ms'])

    output: List[Dict[str, Any]] = []

    for row in store.get_status_counts(since, include_inactive):
        checks: int = row['checks']
        times = sorted(response_times.get(row['target_id'], []))

        output.append({
            'target_id': row['target_id'],
            'checks': checks,
            'ok': row['ok'],
            'slow': row['slow'],
            'degraded': row['degraded'],
            'down': row['down'],
            'availability': _percent(checks - row['down'], checks),
            'healthy': _percent(row['ok'] + row['slow'], checks),
            'p50_ms': _percentile(times, 50),
            'p95_ms': _percentile(times, 95)
        })

    return output


@_cached
def get_timeline(
    days: int,
    resolution: Resolution,
    target_id: str | None = None,
    include_inactive: bool = False
) -> Dict[str, Any]:
    since = _since(days)
    targets: Dict[str, Dict[str, Dict[str, Any]]] = defaultdict(dict)

    for row in store.get_hourly_counts(since, target_id, include_inactive):
        bucket = _to_bucket(datetime.fromtimestamp(row['hour'] * 3600, tz=timezone.utc), resolution)
        entry = targets[row['target_id']].setdefault(bucket, {
            'bucket': bucket, 'checks': 0, 'ok': 0, 'slow': 0, 'degraded': 0, 'down': 0, '_ms_sum': 0.0
        })

        entry['checks'] += row['checks']

        for status in ('ok', 'slow', 'degraded', 'down'):
            entry[status] += row[status]

        if row['avg_ms'] is not None:
            entry['_ms_sum'] += row['avg_ms'] * row['checks']

    series: Dict[str, List[Dict[str, Any]]] = {}

    for id, buckets in targets.items():
        series[id] = []

        for entry in sorted(buckets.values(), key=lambda entry: entry['bucket']):
            ms_sum = entry.pop('_ms_sum')
            entry['avg_ms'] = round(ms_sum / entry['checks']) if entry['checks'] else None
            series[id].append(entry)

    return {
        'resolution': resolution,
        'buckets': _get_bucket_range(since, resolution),
        'targets': series
    }


@_cached
def get_incidents(days: int, kind: str | None = None, limit: int = 500, include_inactive: bool = False) -> Dict[str, Any]:
    incidents = _find_incidents(days, kind, include_inactive)
    incidents.sort(key=lambda incident: incident['started_at'], reverse=True)

    return {
        'count': len(incidents),
        'ongoing': sum(1 for incident in incidents if incident['ended_at'] is None),
        'items': incidents[:limit]
    }


def _find_incidents(days: int, kind: str | None, include_inactive: bool) -> List[Dict[str, Any]]:
    incidents: List[Dict[str, Any]] = []
    current: Dict[str, Any] | None = None
    previous_target: str | None = None

    for row in store.get_status_sequence(_since(days), kind, include_inactive):
        if row['target_id'] != previous_target:
            if current:
                incidents.append(current)
            current = None
            previous_target = row['target_id']

        checked_at = _iso(row['checked_at'])

        if row['status'] in _problem_statuses:
            if current is None:
                current = {
                    'target_id': row['target_id'],
                    'name': row['name'],
                    'kind': row['kind'],
                    'status': row['status'],
                    'started_at': checked_at,
                    'ended_at': None,
                    'duration_minutes': None,
                    'checks': 0,
                    'http_status': row['http_status'],
                    'message': row['message']
                }

            current['checks'] += 1

            if row['status'] == 'down':
                current['status'] = 'down'
        elif current is not None:
            current['ended_at'] = checked_at
            current['duration_minutes'] = _minutes_between(current['started_at'], checked_at)
            incidents.append(current)
            current = None

    if current:
        incidents.append(current)

    return incidents


def _since(days: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days)


def _to_bucket(value: datetime, resolution: Resolution) -> str:
    local = value.astimezone(_tz)

    if resolution == 'day':
        return local.date().isoformat()

    return local.replace(minute=0, second=0, microsecond=0).isoformat()


def _get_bucket_range(since: datetime, resolution: Resolution) -> List[str]:
    step = timedelta(days=1) if resolution == 'day' else timedelta(hours=1)
    current = since.astimezone(_tz).replace(minute=0, second=0, microsecond=0)
    now = datetime.now(timezone.utc)
    buckets: List[str] = []

    while current <= now:
        bucket = _to_bucket(current, resolution)

        if not buckets or buckets[-1] != bucket:
            buckets.append(bucket)

        current += step

    last = _to_bucket(now, resolution)

    if buckets[-1] != last:
        buckets.append(last)

    return buckets


def _percent(part: int, total: int) -> float | None:
    if total == 0:
        return None

    return round(part / total * 100, 2)


def _percentile(values: List[int], percentile: int) -> int | None:
    if not values:
        return None

    if len(values) == 1:
        return values[0]

    return round(statistics.quantiles(values, n=100, method='inclusive')[percentile - 1])


def _iso(epoch: int) -> str:
    return datetime.fromtimestamp(epoch, tz=timezone.utc).isoformat()


def _minutes_between(start: str, end: str) -> int:
    delta = datetime.fromisoformat(end) - datetime.fromisoformat(start)

    return round(delta.total_seconds() / 60)


__all__ = ['get_overview', 'get_statistics', 'get_timeline', 'get_incidents', 'warm_cache']
