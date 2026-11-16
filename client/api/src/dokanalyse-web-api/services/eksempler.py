import json
from pathlib import Path
from typing import Any, Dict
import aiofiles
from async_lru import alru_cache

_filepath = Path(__file__).parent.joinpath('eksempler.geojson')


@alru_cache(maxsize=None)
async def get_eksempler() -> Dict[str, Any]:
    async with aiofiles.open(_filepath) as file:
        json_str = await file.read()

    return json.loads(json_str)


__all__ = ['get_eksempler']
