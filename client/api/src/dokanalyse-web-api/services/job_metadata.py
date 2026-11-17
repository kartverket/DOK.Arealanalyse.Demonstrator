import asyncio
import logging
import time
from os import getenv
from typing import Any, Dict, Iterable, List, Literal
from uuid import UUID
from psycopg import AsyncConnection, sql
from psycopg.rows import DictRow, dict_row
from psycopg_pool import AsyncConnectionPool
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from ..utils.helpers import describe_error

# Opplysninger om analysene som pygeoapi ikke lagrer, f.eks. hvilket område som ble analysert.
# Tabellen ligger i et eget skjema, gjerne i samme database som jobbene til pygeoapi. Er DB_URL
# ikke satt, lagres ingenting, og jobblisten viser analysene uten disse opplysningene.
_DB_URL: str | None = getenv('DB_URL') or None
_DB_SCHEMA: str = getenv('ANALYSIS_DB_SCHEMA', 'dokanalyse')
_DB_POOL_SIZE: int = int(getenv('ANALYSIS_DB_POOL_SIZE', 5))

# Jobblisten skal ikke vente lenge hvis databasen er nede, og etter en feil prøves den ikke igjen på en stund
_DB_TIMEOUT = 5
_RETRY_AFTER_SECONDS = 60

_TABLE = 'analysis_jobs'

# Ingen fremmednøkkel til jobbtabellen til pygeoapi, så vi ikke er avhengige av skjemaet der
_POSTGRES_SCHEMA = f'''
CREATE TABLE IF NOT EXISTS {_TABLE} (
    job_id UUID PRIMARY KEY,
    area_type TEXT NOT NULL,
    description TEXT,
    kommunenummer TEXT,
    kommunenavn TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT now()
);
'''

# Vilkårlig nøkkel for en advisory lock, slik at flere instanser ikke oppretter tabellen samtidig
_POSTGRES_SCHEMA_LOCK_ID = 4_718_293_661

_logger = logging.getLogger(__name__)

_pool_lock = asyncio.Lock()
_pool: AsyncConnectionPool[AsyncConnection[DictRow]] | None = None
_unavailable_until = 0.0

AreaType = Literal['sample', 'file', 'vegadresse', 'eiendom',
                   'reguleringsplan', 'reguleringsplanforslag', 'drawn', 'edited']


class JobMetadata(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra='forbid')

    area_type: AreaType
    description: str | None = Field(default=None, max_length=500)
    kommunenummer: str | None = Field(default=None, pattern=r'^\d{4}$')
    kommunenavn: str | None = Field(default=None, max_length=100)


def is_enabled() -> bool:
    return _DB_URL is not None


async def save(job_id: str, metadata: JobMetadata) -> None:
    pool = await _get_pool()

    if pool is None:
        return

    # Raden kan bli skrevet både fra fremdriften og fra svaret til pygeoapi; den første vinner
    async with pool.connection() as connection:
        await connection.execute(
            f'INSERT INTO {_TABLE} (job_id, area_type, description, kommunenummer, kommunenavn) '
            'VALUES (%s, %s, %s, %s, %s) ON CONFLICT (job_id) DO NOTHING',
            (UUID(job_id), metadata.area_type, metadata.description,
             metadata.kommunenummer, metadata.kommunenavn)
        )


async def get_many(job_ids: Iterable[str]) -> Dict[str, Dict[str, Any]]:
    pool = await _get_pool()
    ids = [UUID(job_id) for job_id in job_ids if _is_uuid(job_id)]

    if pool is None or not ids:
        return {}

    async with pool.connection() as connection:
        cursor = await connection.execute(
            f'SELECT job_id, area_type, description, kommunenummer, kommunenavn FROM {_TABLE} '
            'WHERE job_id = ANY(%s)',
            (ids,)
        )
        rows = await cursor.fetchall()

    return {str(row['job_id']): _to_dict(row) for row in rows}


async def try_save(job_id: str, metadata: JobMetadata) -> None:
    # Analysen skal ikke feile fordi opplysningene ikke kan lagres
    if not _is_available():
        return

    try:
        await save(job_id, metadata)
    except Exception as err:
        _set_unavailable()
        _logger.error('Could not save metadata for job %s: %s', job_id, describe_error(err))


async def add_to_jobs(jobs: List[Dict[str, Any]]) -> None:
    # Jobber uten lagrede opplysninger, f.eks. fra andre klienter, får «metadata: null»
    metadata_by_job_id: Dict[str, Dict[str, Any]] = {}

    if _is_available():
        try:
            metadata_by_job_id = await get_many(job['jobID'] for job in jobs if isinstance(job.get('jobID'), str))
        except Exception as err:
            _set_unavailable()
            _logger.error('Could not get job metadata: %s', describe_error(err))

    for job in jobs:
        job_id = job.get('jobID')
        job['metadata'] = metadata_by_job_id.get(job_id) if isinstance(job_id, str) else None


async def close() -> None:
    global _pool

    async with _pool_lock:
        if _pool is not None:
            await _pool.close()
            _pool = None


def _is_available() -> bool:
    return time.monotonic() >= _unavailable_until


def _set_unavailable() -> None:
    global _unavailable_until
    _unavailable_until = time.monotonic() + _RETRY_AFTER_SECONDS


def _is_uuid(value: str) -> bool:
    try:
        UUID(value)
        return True
    except ValueError:
        return False


def _to_dict(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        'areaType': row['area_type'],
        'description': row['description'],
        'kommunenummer': row['kommunenummer'],
        'kommunenavn': row['kommunenavn']
    }


async def _get_pool() -> AsyncConnectionPool[AsyncConnection[DictRow]] | None:
    global _pool

    if _DB_URL is None:
        return None

    async with _pool_lock:
        if _pool is None:
            pool = AsyncConnectionPool(
                _DB_URL,
                connection_class=AsyncConnection[DictRow],
                min_size=1,
                max_size=_DB_POOL_SIZE,
                kwargs={'row_factory': dict_row, 'autocommit': True},
                configure=_configure_connection,
                timeout=_DB_TIMEOUT,
                name='analysis-jobs',
                open=False
            )
            await pool.open()

            try:
                async with pool.connection() as connection:
                    await _create_schema(connection)
            except Exception:
                await pool.close()
                raise

            _pool = pool

        return _pool


async def _configure_connection(connection: AsyncConnection[DictRow]) -> None:
    await connection.execute(sql.SQL('SET search_path TO {}').format(sql.Identifier(_DB_SCHEMA)))


async def _create_schema(connection: AsyncConnection[DictRow]) -> None:
    # CREATE ... IF NOT EXISTS krever CREATE-rettighet selv om objektet finnes, så det sjekkes først.
    # Da holder det med lese- og skrivetilgang når skjemaet og tabellen er opprettet på forhånd.
    cursor = await connection.execute(
        'SELECT 1 FROM pg_tables WHERE schemaname = %s AND tablename = %s', (_DB_SCHEMA, _TABLE))

    if await cursor.fetchone() is not None:
        return

    async with connection.transaction():
        await connection.execute('SELECT pg_advisory_xact_lock(%s)', (_POSTGRES_SCHEMA_LOCK_ID,))

        cursor = await connection.execute('SELECT 1 FROM pg_namespace WHERE nspname = %s', (_DB_SCHEMA,))

        if await cursor.fetchone() is None:
            await connection.execute(sql.SQL('CREATE SCHEMA {}').format(sql.Identifier(_DB_SCHEMA)))

        await connection.execute(_POSTGRES_SCHEMA)  # type: ignore[arg-type]

    _logger.info('Created table %s.%s', _DB_SCHEMA, _TABLE)
