// Tjenestestatus (client/api: routers/status.py og services/healthcheck)

export type HealthStatus = 'ok' | 'slow' | 'degraded' | 'down';
export type TargetKind = 'dataset' | 'service' | 'endpoint';
export type ServiceType = 'wfs' | 'arcgis' | 'ogc_api' | 'wms' | 'http';

export interface HealthTarget {
    id: string;
    kind: TargetKind;
    name: string;
    service_type: ServiceType | null;
    url: string | null;

    meta: {
        title?: string;
        host?: string;
        group?: string;
        service_name?: string;
        used_by?: string[];
        config_id?: string;
        dataset_name?: string;
        file_name?: string;
        metadata_id?: string | null;
        themes?: string[];
        wms_url?: string | null;
    };
}

export interface ServiceDetails {
    target_id: string;
    url: string;
    status: HealthStatus;
    http_status: number | null;
    response_ms: number;
    message: string | null;
}

export interface LayerDetails {
    name: string | null;
    exists: boolean | null;
    schema_verified: boolean;
    schema_note: string | null;
    missing_properties: string[];
    missing_filter_fields: string[];
    geom_field_missing: boolean;
    missing_wms_layers: string[];
    status: HealthStatus;

    query: {
        status: HealthStatus;
        http_status: number | null;
        response_ms: number;
        hit_count: number | null;
        message: string | null;
    } | null;
}

export interface CheckDetails {
    issues?: string[];
    feature_service?: ServiceDetails;
    wms?: ServiceDetails | null;
    layers?: LayerDetails[];
    missing_guidance_ids?: string[];

    metadata?: {
        found: boolean | null;
        title?: string | null;
        message?: string;
    } | null;

    datasets?: string[];
    commit?: string | null;
}

export interface CheckResult {
    target: HealthTarget;
    checked_at: string;
    status: HealthStatus;
    http_status: number | null;
    response_ms: number | null;
    message: string | null;
    details: CheckDetails;
}

export interface HealthRun {
    id: number;
    started_at: string;
    finished_at: string;
    trigger: string;
    config_ref: string | null;
    config_commit: string | null;
    config_source: string | null;
}

export type StatusCounts = Record<HealthStatus, number> & { total: number };

export interface StatusOverview {
    run: HealthRun | null;
    summary: Partial<Record<TargetKind, StatusCounts>>;
    results: CheckResult[];
}

export interface TargetStatistics {
    target_id: string;
    checks: number;
    ok: number;
    slow: number;
    degraded: number;
    down: number;
    availability: number | null;
    healthy: number | null;
    p50_ms: number | null;
    p95_ms: number | null;
}

export interface TimelineBucket extends Record<HealthStatus, number> {
    bucket: string;
    checks: number;
    avg_ms: number | null;
}

export interface Timeline {
    resolution: 'hour' | 'day';
    buckets: string[];
    targets: Record<string, TimelineBucket[]>;
}

export interface Incident {
    target_id: string;
    name: string;
    kind: TargetKind;
    status: Extract<HealthStatus, 'degraded' | 'down'>;
    started_at: string;
    ended_at: string | null;
    duration_minutes: number | null;
    checks: number;
    http_status: number | null;
    message: string | null;
}

export interface IncidentList {
    count: number;
    ongoing: number;
    items: Incident[];
}

export interface IncidentArgs {
    dager: number;
    type?: TargetKind;
    maks?: number;
}

export interface DaysArgs {
    dager: number;
}

export interface TimelineArgs extends DaysArgs {
    opplosning: 'time' | 'dag';
    mal?: string;
}
