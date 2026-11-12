import json
import sqlite3
import threading
from pathlib import Path
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterator, List
from .models import RunSummary
from . import settings

_SCHEMA = '''
CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at INTEGER NOT NULL,
    finished_at INTEGER NOT NULL,
    trigger TEXT NOT NULL,
    config_ref TEXT,
    config_commit TEXT,
    config_source TEXT
);

CREATE TABLE IF NOT EXISTS targets (
    pk INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    service_type TEXT,
    url TEXT,
    meta TEXT NOT NULL DEFAULT '{}',
    first_seen INTEGER NOT NULL,
    last_seen INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    target_pk INTEGER NOT NULL REFERENCES targets(pk),
    checked_at INTEGER NOT NULL,
    status TEXT NOT NULL,
    http_status INTEGER,
    response_ms INTEGER,
    message TEXT,
    details TEXT
);

CREATE INDEX IF NOT EXISTS ix_results_target_checked ON results(target_pk, checked_at);
CREATE INDEX IF NOT EXISTS ix_results_checked ON results(checked_at);
CREATE INDEX IF NOT EXISTS ix_results_run ON results(run_id);
'''

# Et mål er aktivt hvis det var med i siste kjøring, dvs. at det fortsatt finnes i konfigurasjonen
_ACTIVE_FILTER = 'AND t.pk IN (SELECT target_pk FROM results WHERE run_id = (SELECT MAX(id) FROM runs)) '

_init_lock = threading.Lock()
_initialized = False


@contextmanager
def _connect() -> Iterator[sqlite3.Connection]:
    global _initialized

    path = Path(settings.DB_PATH)
    path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(path, timeout=30)
    connection.row_factory = sqlite3.Row
    connection.execute('PRAGMA foreign_keys = ON')

    try:
        with _init_lock:
            if not _initialized:
                connection.executescript(_SCHEMA)
                _initialized = True

        with connection:
            yield connection
    finally:
        connection.close()


def save_run(summary: RunSummary, trigger: str) -> int:
    started_at = _to_epoch(summary.started_at)

    with _connect() as connection:
        cursor = connection.execute(
            'INSERT INTO runs (started_at, finished_at, trigger, config_ref, config_commit, config_source) '
            'VALUES (?, ?, ?, ?, ?, ?)',
            (started_at, _to_epoch(summary.finished_at), trigger,
             summary.config_ref, summary.config_commit, summary.config_source)
        )
        run_id = cursor.lastrowid

        for result in summary.results:
            target = result.target
            target_pk = connection.execute(
                'INSERT INTO targets (id, kind, name, service_type, url, meta, first_seen, last_seen) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?) '
                'ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, name = excluded.name, '
                'service_type = excluded.service_type, url = excluded.url, meta = excluded.meta, '
                'last_seen = excluded.last_seen '
                'RETURNING pk',
                (target.id, target.kind, target.name, target.service_type, target.url,
                 _dumps(target.meta), started_at, started_at)
            ).fetchone()[0]

            connection.execute(
                'INSERT INTO results (run_id, target_pk, checked_at, status, http_status, response_ms, message, details) '
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                (run_id, target_pk, _to_epoch(result.checked_at), result.status.value,
                 result.http_status, result.response_ms, result.message,
                 _dumps(result.details) if result.details else None)
            )

        return run_id  # type: ignore[return-value]


def delete_old_results() -> None:
    now = datetime.now(timezone.utc)
    cutoff = _to_epoch(now - timedelta(days=settings.RETENTION_DAYS))
    details_cutoff = _to_epoch(now - timedelta(days=settings.DETAILS_RETENTION_DAYS))

    with _connect() as connection:
        connection.execute('DELETE FROM runs WHERE started_at < ?', (cutoff,))
        connection.execute('DELETE FROM targets WHERE pk NOT IN (SELECT target_pk FROM results)')
        connection.execute(
            'UPDATE results SET details = NULL WHERE checked_at < ? AND details IS NOT NULL', (details_cutoff,))


def get_latest_run() -> Dict[str, Any] | None:
    with _connect() as connection:
        row = connection.execute('SELECT * FROM runs ORDER BY id DESC LIMIT 1').fetchone()

        return _run_to_dict(row) if row else None


def get_latest_run_id() -> int | None:
    with _connect() as connection:
        return connection.execute('SELECT MAX(id) FROM runs').fetchone()[0]


def get_latest_results(run_id: int) -> List[Dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute(
            'SELECT t.id AS target_id, t.kind, t.name, t.service_type, t.url, t.meta, '
            'r.checked_at, r.status, r.http_status, r.response_ms, r.message, r.details '
            'FROM results r JOIN targets t ON t.pk = r.target_pk '
            'WHERE r.run_id = ? ORDER BY t.kind, t.name',
            (run_id,)
        ).fetchall()

        return [_result_to_dict(row) for row in rows]


def get_target(target_id: str) -> Dict[str, Any] | None:
    with _connect() as connection:
        row = connection.execute('SELECT * FROM targets WHERE id = ?', (target_id,)).fetchone()

        if row is None:
            return None

        return {
            'id': row['id'],
            'kind': row['kind'],
            'name': row['name'],
            'service_type': row['service_type'],
            'url': row['url'],
            'meta': json.loads(row['meta']),
            'first_seen': _from_epoch(row['first_seen']),
            'last_seen': _from_epoch(row['last_seen'])
        }


def get_target_history(target_id: str, since: datetime) -> List[Dict[str, Any]]:
    with _connect() as connection:
        rows = connection.execute(
            'SELECT r.checked_at, r.status, r.http_status, r.response_ms, r.message '
            'FROM results r JOIN targets t ON t.pk = r.target_pk '
            'WHERE t.id = ? AND r.checked_at >= ? ORDER BY r.checked_at',
            (target_id, _to_epoch(since))
        ).fetchall()

        return [{
            'checked_at': _from_epoch(row['checked_at']),
            'status': row['status'],
            'http_status': row['http_status'],
            'response_ms': row['response_ms'],
            'message': row['message']
        } for row in rows]


def get_status_counts(since: datetime, include_inactive: bool = False) -> List[sqlite3.Row]:
    active_filter = '' if include_inactive else _ACTIVE_FILTER

    with _connect() as connection:
        return connection.execute(
            'SELECT t.id AS target_id, COUNT(*) AS checks, '
            "SUM(r.status = 'ok') AS ok, SUM(r.status = 'slow') AS slow, "
            "SUM(r.status = 'degraded') AS degraded, SUM(r.status = 'down') AS down "
            'FROM results r JOIN targets t ON t.pk = r.target_pk '
            f'WHERE r.checked_at >= ? {active_filter}GROUP BY t.id',
            (_to_epoch(since),)
        ).fetchall()


def get_response_times(since: datetime, include_inactive: bool = False) -> List[sqlite3.Row]:
    active_filter = '' if include_inactive else _ACTIVE_FILTER

    with _connect() as connection:
        return connection.execute(
            'SELECT t.id AS target_id, r.response_ms '
            'FROM results r JOIN targets t ON t.pk = r.target_pk '
            "WHERE r.checked_at >= ? AND r.response_ms IS NOT NULL AND r.status != 'down' "
            f'{active_filter}',
            (_to_epoch(since),)
        ).fetchall()


def get_hourly_counts(since: datetime, target_id: str | None = None, include_inactive: bool = False) -> List[sqlite3.Row]:
    # Et mål det spørres eksplisitt etter, returneres også om det er inaktivt
    target_filter = 'AND t.id = ? ' if target_id else ('' if include_inactive else _ACTIVE_FILTER)
    params: List[Any] = [_to_epoch(since)] + ([target_id] if target_id else [])

    with _connect() as connection:
        return connection.execute(
            'SELECT t.id AS target_id, r.checked_at / 3600 AS hour, COUNT(*) AS checks, '
            "SUM(r.status = 'ok') AS ok, SUM(r.status = 'slow') AS slow, "
            "SUM(r.status = 'degraded') AS degraded, SUM(r.status = 'down') AS down, "
            'AVG(r.response_ms) AS avg_ms '
            'FROM results r JOIN targets t ON t.pk = r.target_pk '
            f'WHERE r.checked_at >= ? {target_filter}'
            'GROUP BY t.id, hour ORDER BY hour',
            params
        ).fetchall()


def get_status_sequence(since: datetime, kind: str | None = None, include_inactive: bool = False) -> List[sqlite3.Row]:
    kind_filter = 'AND t.kind = ? ' if kind else ''
    active_filter = '' if include_inactive else _ACTIVE_FILTER
    params: List[Any] = [_to_epoch(since)] + ([kind] if kind else [])

    with _connect() as connection:
        return connection.execute(
            'SELECT t.id AS target_id, t.name, t.kind, r.checked_at, r.status, r.http_status, r.message '
            'FROM results r JOIN targets t ON t.pk = r.target_pk '
            f'WHERE r.checked_at >= ? {kind_filter}{active_filter}ORDER BY t.id, r.checked_at',
            params
        ).fetchall()


def _run_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        'id': row['id'],
        'started_at': _from_epoch(row['started_at']),
        'finished_at': _from_epoch(row['finished_at']),
        'trigger': row['trigger'],
        'config_ref': row['config_ref'],
        'config_commit': row['config_commit'],
        'config_source': row['config_source']
    }


def _result_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        'target': {
            'id': row['target_id'],
            'kind': row['kind'],
            'name': row['name'],
            'service_type': row['service_type'],
            'url': row['url'],
            'meta': json.loads(row['meta'])
        },
        'checked_at': _from_epoch(row['checked_at']),
        'status': row['status'],
        'http_status': row['http_status'],
        'response_ms': row['response_ms'],
        'message': row['message'],
        'details': json.loads(row['details']) if row['details'] else {}
    }


def _dumps(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, default=str)


def _to_epoch(value: datetime) -> int:
    return int(value.timestamp())


def _from_epoch(value: int) -> str:
    return datetime.fromtimestamp(value, tz=timezone.utc).isoformat()


__all__ = ['save_run', 'delete_old_results', 'get_latest_run', 'get_latest_run_id', 'get_latest_results', 'get_target',
           'get_target_history', 'get_status_counts', 'get_response_times', 'get_hourly_counts',
           'get_status_sequence']
