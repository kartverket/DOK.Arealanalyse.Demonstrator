import dayjs from 'dayjs';
import {
    DAY_DEGRADED_SHARE,
    DAY_DOWN_THRESHOLD,
    DAY_UNSTABLE_THRESHOLD,
} from './constants';

import type {
    HealthStatus,
    HealthTarget,
    TimelineBucket,
} from '@/types/health.types';

export function getDisplayName(target: HealthTarget): string {
    return target.meta.title || target.name;
}

export function getAvailability(bucket: TimelineBucket): number {
    return bucket.checks
        ? ((bucket.checks - bucket.down) / bucket.checks) * 100
        : 0;
}

export function getBucketStatus(bucket: TimelineBucket): HealthStatus {
    const availability = getAvailability(bucket);
    if (availability < DAY_DOWN_THRESHOLD) {
        return 'down';
    }

    if (bucket.degraded / bucket.checks >= DAY_DEGRADED_SHARE) {
        return 'degraded';
    }

    if (
        availability < DAY_UNSTABLE_THRESHOLD ||
        bucket.slow / bucket.checks >= 0.5
    ) {
        return 'slow';
    }

    return 'ok';
}

export function formatPercent(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '–';
    }

    const decimals = value === 100 ? 0 : value >= 99 ? 2 : 1;
    return `${value.toLocaleString('nb-NO', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })} %`;
}

export function formatMs(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '–';
    }

    if (value >= 1000) {
        return `${(value / 1000).toLocaleString('nb-NO', { maximumFractionDigits: 1 })} s`;
    }

    return `${value.toLocaleString('nb-NO')} ms`;
}

export function formatDuration(minutes: number | null): string {
    if (minutes === null) {
        return 'pågår';
    }

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (hours < 24) {
        return rest ? `${hours} t ${rest} min` : `${hours} t`;
    }

    return `${Math.floor(hours / 24)} d ${hours % 24} t`;
}

export function formatDateTime(value: string): string {
    return dayjs(value).format('DD.MM.YYYY HH:mm');
}

export function formatBucket(
    bucket: string,
    resolution: 'hour' | 'day',
): string {
    return resolution === 'day'
        ? dayjs(bucket).format('DD.MM.YYYY')
        : dayjs(bucket).format('DD.MM HH:00');
}

export function formatRelative(value: string): string {
    const minutes = dayjs().diff(dayjs(value), 'minute');
    if (minutes < 1) {
        return 'nå nettopp';
    }

    if (minutes < 60) {
        return `for ${minutes} min siden`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `for ${hours} t siden`;
    }

    return formatDateTime(value);
}
