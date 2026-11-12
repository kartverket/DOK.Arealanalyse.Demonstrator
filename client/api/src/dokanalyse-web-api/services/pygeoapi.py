import asyncio
from os import environ
from typing import Any, Dict
import aiohttp
from .exceptions import HttpError
from ..utils.session_registry import get_session

_API_URL = environ['PYGEOAPI_API_URL']


async def analyze(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        async with get_session().post(_API_URL, json=payload) as response:
            if response.status == 404:
                raise HttpError(404)

            try:
                body = await response.json(content_type=None)
            except ValueError:
                body = None

            if response.status >= 400:
                raise HttpError(response.status, body if isinstance(body, dict) else None)

            if not isinstance(body, dict):
                raise HttpError(502)

            return body
    except aiohttp.ClientError:
        raise HttpError(502)
    except asyncio.TimeoutError:
        raise HttpError(504)
