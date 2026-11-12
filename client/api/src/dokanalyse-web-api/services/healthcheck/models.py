from enum import StrEnum
from uuid import UUID
from datetime import datetime
from typing import Any, Dict, List, Literal
from pydantic import BaseModel, Field, HttpUrl

ServiceType = Literal['wfs', 'arcgis', 'ogc_api', 'wms', 'http']
TargetKind = Literal['dataset', 'service', 'endpoint']


class Status(StrEnum):
    OK = 'ok'
    SLOW = 'slow'
    DEGRADED = 'degraded'
    DOWN = 'down'


_SEVERITY = {
    Status.OK: 0,
    Status.SLOW: 1,
    Status.DEGRADED: 2,
    Status.DOWN: 3
}


def worst_status(*statuses: Status) -> Status:
    return max(statuses, key=lambda status: _SEVERITY[status], default=Status.OK)


class Auth(BaseModel):
    username: str | None = None
    password: str | None = None
    api_key: str | None = None


class FeatureService(BaseModel):
    url: HttpUrl
    auth: Auth | None = None


class LayerConfig(BaseModel):
    wfs: str | None = None
    arcgis: str | None = None
    ogc_api: str | None = None
    wms: List[str] = []
    filter: str | None = None
    planning_guidance_id: UUID | None = None
    building_guidance_id: UUID | None = None

    model_config = {
        'extra': 'ignore',
        'coerce_numbers_to_str': True
    }


class DatasetConfig(BaseModel):
    config_id: UUID
    name: str
    title: str | None = None
    metadata_id: UUID | None = None
    wfs: HttpUrl | FeatureService | None = None
    arcgis: HttpUrl | FeatureService | None = None
    ogc_api: HttpUrl | FeatureService | None = None
    wms: HttpUrl | None = None
    layers: List[LayerConfig] = []
    geom_field: str | None = None
    properties: List[str] | Literal['*'] | None = None
    themes: List[str] = []
    file_name: str

    model_config = {
        'extra': 'ignore',
        'coerce_numbers_to_str': True
    }

    @property
    def service_type(self) -> Literal['wfs', 'arcgis', 'ogc_api'] | None:
        if self.wfs:
            return 'wfs'
        if self.arcgis:
            return 'arcgis'
        if self.ogc_api:
            return 'ogc_api'
        return None

    @property
    def feature_service(self) -> HttpUrl | FeatureService | None:
        return self.wfs or self.arcgis or self.ogc_api


class InvalidConfig(BaseModel):
    file_name: str
    config_id: str | None = None
    name: str | None = None
    error: str


class Target(BaseModel):
    id: str
    kind: TargetKind
    name: str
    service_type: ServiceType | None = None
    url: str | None = None
    meta: Dict[str, Any] = {}


class CheckResult(BaseModel):
    target: Target
    status: Status
    http_status: int | None = None
    response_ms: int | None = None
    message: str | None = None
    details: Dict[str, Any] = {}
    checked_at: datetime


class RunSummary(BaseModel):
    started_at: datetime
    finished_at: datetime
    config_ref: str
    config_commit: str | None = None
    config_source: str
    results: List[CheckResult] = Field(default_factory=list)
