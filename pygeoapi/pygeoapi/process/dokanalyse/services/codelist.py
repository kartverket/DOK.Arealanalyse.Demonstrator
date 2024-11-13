from os import path
from pathlib import Path
import json
from typing import List
import aiohttp
from ..helpers.common import should_refresh_cache

__CACHE_DAYS = 7

__CODELISTS = {
    'fullstendighet_dekning': 'https://register.geonorge.no/api/sosi-kodelister/temadata/fullstendighetsdekningskart/dekningsstatus.json'
}


async def get_codelist(type: str) -> List[dict] | None:
    url = __CODELISTS.get(type)

    if url is None:
        return None

    file_path = Path(
        path.join(Path.home(), f'pygeoapi/dokanalyse/codelists/{type}.json'))

    if not file_path.exists() or should_refresh_cache(file_path, __CACHE_DAYS):
        file_path.parent.mkdir(parents=True, exist_ok=True)
        codelist = await __get_codelist(url)

        if codelist is None:
            return None

        json_object = json.dumps(codelist, indent=2)

        with file_path.open('w', encoding='utf-8') as file:
            file.write(json_object)

        return codelist
    else:
        with file_path.open(encoding='utf-8') as file:
            codelist = json.load(file)

        return codelist


async def __get_codelist(url: str) -> List[dict]:
    response = await __fetch_codelist(url)

    if response is None:
        return None

    contained_items = response.get('containeditems', [])
    entries = []

    for item in contained_items:
        is_valid = item.get('status', False)

        if not is_valid:
            continue

        entries.append({
            'value': item.get('codevalue'),
            'label': item.get('label'),
            'description': item.get('description')
        })

    return entries


async def __fetch_codelist(url: str) -> dict:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    return None

                return await response.json()
    except:
        return None
