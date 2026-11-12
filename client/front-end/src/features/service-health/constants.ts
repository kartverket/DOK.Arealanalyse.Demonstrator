import type {
    HealthStatus,
    ServiceType,
    TargetKind,
} from '@/types/health.types';

export const STATUS_LABELS = {
    ok: 'OK',
    slow: 'Treg',
    degraded: 'Avvik',
    down: 'Nede',
} as const satisfies Record<HealthStatus, string>;

export const STATUS_COLORS = {
    ok: 'success',
    slow: 'info',
    degraded: 'warning',
    down: 'danger',
} as const satisfies Record<HealthStatus, string>;

export const STATUS_ORDER: HealthStatus[] = ['down', 'degraded', 'slow', 'ok'];

export const KIND_LABELS = {
    dataset: 'Datasett',
    service: 'Tjenester',
    endpoint: 'Andre avhengigheter',
} as const satisfies Record<TargetKind, string>;

export const SERVICE_TYPE_LABELS = {
    wfs: 'WFS',
    arcgis: 'ArcGIS REST',
    ogc_api: 'OGC API',
    wms: 'WMS',
    http: 'HTTP',
} as const satisfies Record<ServiceType, string>;

export const PERIODS = [7, 30, 90] as const;

export type Period = (typeof PERIODS)[number];

// Grenser for dagsstatus i historikkstripen
export const DAY_DOWN_THRESHOLD = 95;
export const DAY_UNSTABLE_THRESHOLD = 100;
export const DAY_DEGRADED_SHARE = 0.5;
