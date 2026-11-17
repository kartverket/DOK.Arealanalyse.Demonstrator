import type { JobStatus } from '@/types/api.types';

export const JOB_STATUS_LABELS = {
    accepted: 'I kø',
    running: 'Kjører',
    successful: 'Fullført',
    failed: 'Feilet',
    dismissed: 'Avbrutt',
} as const satisfies Record<JobStatus, string>;

export const JOB_STATUS_COLORS = {
    accepted: 'neutral',
    running: 'info',
    successful: 'success',
    failed: 'danger',
    dismissed: 'warning',
} as const satisfies Record<JobStatus, string>;

// Hvorfor resultatet ikke kan vises
export const JOB_UNAVAILABLE_TEXTS = {
    accepted:
        'DOK-analysen venter i kø. Resultatet kan vises når analysen er ferdig.',
    running:
        'DOK-analysen kjører fortsatt. Resultatet kan vises når analysen er ferdig.',
    failed: 'DOK-analysen feilet.',
    dismissed: 'DOK-analysen ble avbrutt.',
} as const satisfies Record<Exclude<JobStatus, 'successful'>, string>;

export const FINAL_JOB_STATUSES: JobStatus[] = [
    'successful',
    'failed',
    'dismissed',
];

export const JOBS_PER_PAGE = 5;
