import re
import json
import time
import asyncio
from os import getenv
from dataclasses import dataclass
from urllib.parse import urlsplit
from typing import Any, Awaitable, Callable, Dict, List, Literal, Tuple, TypeVar
import aiohttp
from lxml import etree as ET
from .models import Auth, Status
from . import settings

_credential_regex = re.compile(r'^\$\{(?P<env_var>.*?)\}$')
_xml_parser = ET.XMLParser(
    resolve_entities=False, no_network=True, huge_tree=True)
_exception_roots = ('ExceptionReport', 'ServiceExceptionReport')

T = TypeVar('T')


@dataclass
class HttpResult:
    url: str
    status: int | None
    response_ms: int
    body: bytes | None = None
    error: str | None = None
    missing_env: List[str] | None = None

    @property
    def ok(self) -> bool:
        return self.status is not None and 200 <= self.status < 300


@dataclass
class Assessment:
    status: Status
    message: str | None
    parsed: Any = None


@dataclass
class ResolvedAuth:
    basic: aiohttp.BasicAuth | None
    headers: Dict[str, str]
    missing_env: List[str]


def create_session() -> aiohttp.ClientSession:
    connector = aiohttp.TCPConnector(limit=settings.MAX_CONCURRENCY * 2)

    return aiohttp.ClientSession(
        connector=connector,
        headers={'User-Agent': settings.USER_AGENT},
        trust_env=True
    )


class RunContext:
    def __init__(self, session: aiohttp.ClientSession) -> None:
        self.session = session
        self.__cache: Dict[Tuple, asyncio.Task[HttpResult]] = {}
        self.__memo: Dict[str, asyncio.Task[Any]] = {}
        self.__semaphore = asyncio.Semaphore(settings.MAX_CONCURRENCY)
        self.__host_semaphores: Dict[str, asyncio.Semaphore] = {}

    async def memo(self, key: str, factory: Callable[[], Awaitable[T]]) -> T:
        task = self.__memo.get(key)

        if task is None:
            task = asyncio.ensure_future(factory())
            self.__memo[key] = task

        return await task

    def memoized_values(self) -> List[Any]:
        return [task.result() for task in self.__memo.values()
                if task.done() and not task.cancelled() and task.exception() is None]

    async def request(
        self,
        method: Literal['GET', 'POST'],
        url: str,
        *,
        params: Dict[str, Any] | None = None,
        data: Any = None,
        headers: Dict[str, str] | None = None,
        auth: Auth | None = None
    ) -> HttpResult:
        key = (method, url, _freeze(params), _freeze(data), _freeze(headers),
               auth.model_dump_json() if auth else None)
        task = self.__cache.get(key)

        if task is None:
            task = asyncio.ensure_future(self.__request(
                method, url, params, data, headers, auth))
            self.__cache[key] = task

        return await task

    async def __request(
        self,
        method: str,
        url: str,
        params: Dict[str, Any] | None,
        data: Any,
        headers: Dict[str, str] | None,
        auth: Auth | None
    ) -> HttpResult:
        host = urlsplit(url).hostname or ''
        host_semaphore = self.__host_semaphores.setdefault(
            host, asyncio.Semaphore(settings.MAX_CONCURRENCY_PER_HOST))

        async with host_semaphore, self.__semaphore:
            return await self.__send(method, url, params, data, headers, auth)

    async def __send(
        self,
        method: str,
        url: str,
        params: Dict[str, Any] | None,
        data: Any,
        headers: Dict[str, str] | None,
        auth: Auth | None
    ) -> HttpResult:
        resolved = resolve_auth(auth)
        timeout = aiohttp.ClientTimeout(total=settings.REQUEST_TIMEOUT)
        start = time.perf_counter()

        try:
            async with self.session.request(
                method,
                url,
                params=params,
                data=data,
                headers={**(headers or {}), **resolved.headers},
                auth=resolved.basic,
                timeout=timeout
            ) as response:
                body = await response.read()

                return HttpResult(str(response.url), response.status, _elapsed(start), body,
                                  missing_env=resolved.missing_env)
        except asyncio.TimeoutError:
            error = f'Tidsavbrudd etter {settings.REQUEST_TIMEOUT} s'
        except aiohttp.ClientHttpProxyError as err:
            error = f'Proxy avviste forespørselen (HTTP {err.status})'
        except aiohttp.ClientConnectorError as err:
            error = f'Kunne ikke koble til {err.host}'
        except aiohttp.ClientError as err:
            error = f'{type(err).__name__}: {err}'

        return HttpResult(url, None, _elapsed(start), None, error, resolved.missing_env)


def resolve_auth(auth: Auth | None) -> ResolvedAuth:
    if auth is None:
        return ResolvedAuth(None, {}, [])

    missing: List[str] = []

    def resolve(value: str) -> str:
        match = _credential_regex.search(value)

        if not match:
            return value

        env_var = match.group('env_var')
        resolved = getenv(env_var)

        if resolved is None:
            missing.append(env_var)
            return value

        return resolved

    headers: Dict[str, str] = {}
    basic: aiohttp.BasicAuth | None = None

    if auth.api_key:
        headers['x-api-key'] = resolve(auth.api_key)
    elif auth.username and auth.password:
        basic = aiohttp.BasicAuth(resolve(auth.username), resolve(auth.password))

    return ResolvedAuth(basic, headers, missing)


def assess(result: HttpResult, expect: Literal['xml', 'json', 'any']) -> Assessment:
    if result.status is None:
        return Assessment(Status.DOWN, result.error or 'Ingen respons')

    if not result.ok:
        message = f'HTTP {result.status}'

        if result.missing_env:
            message += f' (mangler miljøvariabel: {", ".join(result.missing_env)})'

        return Assessment(Status.DOWN, message)

    parsed: Any = None

    if expect == 'xml':
        parsed = parse_xml(result.body)

        if parsed is None:
            return Assessment(Status.DOWN, 'Ugyldig XML i responsen')

        exception = get_exception_text(parsed)

        if exception is not None:
            return Assessment(Status.DOWN, f'Tjenesten returnerte en feilmelding: {exception}')
    elif expect == 'json':
        parsed = parse_json(result.body)

        if parsed is None:
            return Assessment(Status.DOWN, 'Ugyldig JSON i responsen')

        if isinstance(parsed, dict) and isinstance(parsed.get('error'), dict):
            error: Dict[str, Any] = parsed['error']
            return Assessment(Status.DOWN, f'Tjenesten returnerte en feilmelding: {error.get("code", "")} {error.get("message", "")}'.strip())

    if result.response_ms > settings.SLOW_THRESHOLD_MS:
        return Assessment(Status.SLOW, f'Treg respons ({result.response_ms} ms)', parsed)

    return Assessment(Status.OK, None, parsed)


def parse_xml(body: bytes | None) -> ET._Element | None:
    if not body:
        return None

    try:
        return ET.fromstring(body, parser=_xml_parser)
    except ET.XMLSyntaxError:
        return None


def parse_json(body: bytes | None) -> Any:
    if not body:
        return None

    try:
        return json.loads(body)
    except ValueError:
        return None


def get_exception_text(root: ET._Element) -> str | None:
    if local_name(root.tag) not in _exception_roots:
        return None

    text = ' '.join(part.strip() for part in root.itertext() if part.strip())

    return text[:300] or local_name(root.tag)


def local_name(tag: Any) -> str:
    if not isinstance(tag, str):
        return ''

    return tag.split('}')[-1].split(':')[-1]


def _elapsed(start: float) -> int:
    return round((time.perf_counter() - start) * 1000)


def _freeze(value: Any) -> Any:
    if value is None or isinstance(value, (str, bytes)):
        return value

    return json.dumps(value, sort_keys=True, default=str)


__all__ = ['HttpResult', 'Assessment', 'RunContext', 'create_session', 'resolve_auth',
           'assess', 'parse_xml', 'parse_json', 'get_exception_text', 'local_name']
