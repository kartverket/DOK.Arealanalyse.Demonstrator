import re
from typing import Any, Dict, List
from async_lru import alru_cache
import Levenshtein
from .eiendom import search_by_matrikkel_no, search_by_adresse
from .plan import search_plan_ids

_MAX_HITS = 10

_matrikkel_pattern = re.compile(
    r'^\s*'
    r'(?P<gardsnummer>[1-9]\d*)'
    r'(?:\s*(?:/|-)\s*|\s+)(?P<bruksnummer>[1-9]\d*)'
    r'(?:(?:\s*(?:/|-)\s*|\s+)(?P<festenummer>\d+))?'
    r'(?:(?:\s*(?:/|-)\s*|\s+)(?P<seksjonsnummer>\d+))?'
    r'\s*$'
)

_adresse_pattern = re.compile(r'^[a-zæøå]{3}', flags=re.IGNORECASE)


@alru_cache(maxsize=None, ttl=86400)
async def search(kommunenummer: str, search_str: str) -> Dict[str, Any]:
    search_str = search_str.strip()

    if len(search_str) < 3:
        return {
            'type': 'FeatureCollection',
            'features': []
        }

    features: List[Dict[str, Any]] = []
    matrikkel_match = _matrikkel_pattern.match(search_str)

    if matrikkel_match:
        response = await search_by_matrikkel_no(kommunenummer, matrikkel_match.groupdict())
        features = response['features']
    elif _adresse_pattern.match(search_str):
        response = await search_by_adresse(kommunenummer, search_str)
        features = response['features']

    plan_ids = await _get_plan_ids(kommunenummer, search_str)
    features.extend(plan_ids)

    sorted_features = sorted(
        features,
        key=lambda feature: Levenshtein.distance(
            feature['properties']['value'], search_str)
    )

    sliced_features = sorted_features[:_MAX_HITS]
    id = 1

    for feature in sliced_features:
        feature['id'] = id
        id += 1


    print(sliced_features)

    return {
        'type': 'FeatureCollection',
        'features': sliced_features
    }


async def _get_plan_ids(kommunenummer: str, search_str: str) -> List[Dict[str, Any]]:
    result = await search_plan_ids(kommunenummer, search_str)
    features: List[Dict[str, Any]] = []

    for type, plan_ids in result.items():
        for plan_id in plan_ids:
            features.append({
                'type': 'Feature',
                'geometry': None,
                'properties': {
                    'type': type,
                    'value': plan_id,
                    'data': {
                        'planId': plan_id
                    }
                }
            })

    return features


__all__ = ['search']
