import json
from pathlib import Path
from typing import Any, Dict, List
import aiofiles
from async_lru import alru_cache

_dirpath = Path(__file__).parent.parent.joinpath('samples')
_config_filepath = _dirpath.joinpath('config.json')


@alru_cache(maxsize=None)
async def get_samples() -> List[Dict[str, Any]]:
    config: List[Dict[str, Any]] = await _read_json_file(_config_filepath)

    for item in config:
        filename: str = item['fileName']
        item['geoJson'] = await _read_json_file(_dirpath.joinpath(filename))

    return config


async def _read_json_file(path: Path) -> Any:
    async with aiofiles.open(path) as file:
        json_str = await file.read()

    return json.loads(json_str)


__all__ = ['get_samples']
