from os import environ
from typing import Any, Dict
import aiohttp

_API_URL = environ['PYGEOAPI_API_URL']


async def analyze(payload: Dict[str, Any]) -> Dict[str, Any]:
    async with aiohttp.ClientSession() as session:
        async with session.post(_API_URL, json=payload) as response:
            data = await response.json()
            
            if response.status != 200:
                raise Exception(data)

            return data
