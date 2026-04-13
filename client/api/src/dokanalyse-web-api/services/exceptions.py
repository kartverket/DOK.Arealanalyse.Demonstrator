from typing import Any, Dict


class InvalidDatasetError(Exception):
    ...


class InvalidGeometryError(Exception):
    ...


class GeometryConversionError(Exception):
    ...


class HttpError(Exception):
    def __init__(self, status: int, body: Dict[str, Any] | None = None):
        self.status = status
        self.body = body
        super().__init__(f'HTTP {status}: {body}')
