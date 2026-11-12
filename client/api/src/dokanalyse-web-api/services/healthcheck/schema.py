import re
from typing import Any, Dict, Iterable, List, Set
from lxml import etree as ET
from .http_client import local_name

_XS = '{http://www.w3.org/2001/XMLSchema}'
_MAX_DEPTH = 5
_string_literal_regex = re.compile(r"'(?:[^']|'')*'")
_identifier_regex = re.compile(r'[^\W\d]\w*')
_cql_keywords = {
    'AND', 'OR', 'NOT', 'IN', 'LIKE', 'ILIKE', 'IS', 'NULL', 'BETWEEN', 'TRUE', 'FALSE'
}


def get_filter_fields(cql_text: str | None) -> List[str]:
    if not cql_text:
        return []

    without_literals = _string_literal_regex.sub('', cql_text)
    fields: List[str] = []

    for match in _identifier_regex.finditer(without_literals):
        name = match.group(0)

        if name.upper() not in _cql_keywords and name not in fields:
            fields.append(name)

    return fields


def get_xsd_feature_paths(root: ET._Element, feature_name: str) -> Set[str] | None:
    complex_types = _index_by_name(root.iter(f'{_XS}complexType'))
    elements = _index_by_name(root.findall(f'{_XS}element'))

    feature_element = elements.get(local_name(feature_name))

    if feature_element is None:
        return None

    type_node = _get_element_type(feature_element, complex_types)

    if type_node is None:
        return None

    paths: Set[str] = set()
    _walk(type_node, '', 0, frozenset(), complex_types, elements, paths)

    return paths


def get_json_paths(properties: Dict[str, Any], prefix: str = '', depth: int = 0) -> Set[str]:
    paths: Set[str] = set()

    for key, value in properties.items():
        path = prefix + key
        paths.add(path)

        if isinstance(value, dict) and depth < _MAX_DEPTH:
            paths |= get_json_paths(value, path + '.', depth + 1)

    return paths


def get_missing(required: Iterable[str], available: Set[str]) -> List[str]:
    return [path for path in required if path not in available]


def _index_by_name(nodes: Iterable[ET._Element]) -> Dict[str, ET._Element]:
    index: Dict[str, ET._Element] = {}

    for node in nodes:
        name = node.get('name')

        if name:
            index[name] = node

    return index


def _get_element_type(element: ET._Element, complex_types: Dict[str, ET._Element]) -> ET._Element | None:
    anonymous = element.find(f'{_XS}complexType')

    if anonymous is not None:
        return anonymous

    type_name = element.get('type')

    if not type_name:
        return None

    return complex_types.get(local_name(type_name))


def _walk(
    node: ET._Element,
    prefix: str,
    depth: int,
    seen: frozenset[str],
    complex_types: Dict[str, ET._Element],
    elements: Dict[str, ET._Element],
    paths: Set[str]
) -> None:
    for child in node:
        if not isinstance(child.tag, str):
            continue

        tag = local_name(child.tag)

        if tag == 'element':
            ref = child.get('ref')
            name = child.get('name') or (local_name(ref) if ref else None)

            if not name:
                continue

            path = prefix + name
            paths.add(path)

            if depth >= _MAX_DEPTH:
                continue

            target = elements.get(name, child) if ref else child
            type_node = _get_element_type(target, complex_types)
            type_name = local_name(target.get('type') or '')

            if type_node is not None and type_name not in seen:
                _walk(type_node, path + '.', depth + 1, seen | {type_name},
                      complex_types, elements, paths)
        elif tag in ('extension', 'restriction'):
            base_name = local_name(child.get('base') or '')
            base = complex_types.get(base_name)

            if base is not None and base_name not in seen:
                _walk(base, prefix, depth, seen | {base_name},
                      complex_types, elements, paths)

            _walk(child, prefix, depth, seen, complex_types, elements, paths)
        elif tag not in ('annotation', 'attribute', 'attributeGroup', 'anyAttribute', 'simpleType'):
            _walk(child, prefix, depth, seen, complex_types, elements, paths)


__all__ = ['get_filter_fields', 'get_xsd_feature_paths',
           'get_json_paths', 'get_missing']
