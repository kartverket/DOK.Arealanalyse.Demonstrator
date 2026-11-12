from os import getenv


def _get_bool(key: str, default: bool) -> bool:
    value = getenv(key)

    if value is None:
        return default

    return value.strip().lower() in ('1', 'true', 'yes')


CONFIG_REPO: str = getenv(
    'HEALTHCHECK_CONFIG_REPO', 'kartverket/DOK.Arealanalyse.Config')
CONFIG_REF: str = getenv('HEALTHCHECK_CONFIG_REF', 'main')
DB_PATH: str = getenv('HEALTHCHECK_DB_PATH', '/tmp/dokanalyse-healthcheck.db')
ENABLED: bool = _get_bool('HEALTHCHECK_ENABLED', False)
INTERVAL_MINUTES: int = int(getenv('HEALTHCHECK_INTERVAL_MINUTES', 15))
RETENTION_DAYS: int = int(getenv('HEALTHCHECK_RETENTION_DAYS', 90))
DETAILS_RETENTION_DAYS: int = int(
    getenv('HEALTHCHECK_DETAILS_RETENTION_DAYS', 7))
REQUEST_TIMEOUT: int = int(getenv('HEALTHCHECK_REQUEST_TIMEOUT', 30))
SLOW_THRESHOLD_MS: int = int(getenv('HEALTHCHECK_SLOW_THRESHOLD_MS', 5000))
MAX_CONCURRENCY: int = int(getenv('HEALTHCHECK_MAX_CONCURRENCY', 10))
MAX_CONCURRENCY_PER_HOST: int = 3
PYGEOAPI_API_URL: str | None = getenv('PYGEOAPI_API_URL')
USER_AGENT: str = 'DOK-Arealanalyse-Healthcheck/1.0'
TIMEZONE: str = 'Europe/Oslo'

# Testområde (EPSG:25833) for intersect-spørringer: 500 x 500 m i Drammen
TEST_EPSG: int = 25833
TEST_BBOX: tuple[float, float, float, float] = (
    230000.0, 6632500.0, 230500.0, 6633000.0)
