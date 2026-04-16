from typing import cast
import aiohttp

_http_session: aiohttp.ClientSession | None = None


def get_session() -> aiohttp.ClientSession:
    return cast(aiohttp.ClientSession, _http_session)


def set_session(session: aiohttp.ClientSession | None) -> None:
    global _http_session
    _http_session = session


__all__ = ['get_session']
