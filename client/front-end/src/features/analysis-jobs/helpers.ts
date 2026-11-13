import dayjs from 'dayjs';
import { FINAL_JOB_STATUSES } from './constants';

import type { AnalysisJob, JobStatus } from '@/types/api.types';

export function isFinalJobStatus(status: JobStatus): boolean {
    return FINAL_JOB_STATUSES.includes(status);
}

export function formatDateTime(value: string | null | undefined): string {
    return value ? dayjs(value).format('DD.MM.YYYY HH:mm:ss') : '–';
}

export function formatDuration(job: AnalysisJob): string {
    if (!job.started || !job.finished) {
        return '–';
    }

    const seconds = Math.max(
        0,
        Math.round(
            dayjs(job.finished).diff(dayjs(job.started), 'second', true),
        ),
    );

    if (seconds < 60) {
        return `${seconds} s`;
    }

    return `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
}
