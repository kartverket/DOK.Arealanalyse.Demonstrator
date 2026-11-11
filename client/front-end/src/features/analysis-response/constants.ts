import type { ResultStatus as ResultStatusValue } from '@/types/api.types';

export const StatusFilter = {
    MUST_HANDLE: 'mustHandle',
    MUST_CHECK: 'mustCheck',
    NEARBY: 'nearby',
    NOT_ANALYZED: 'notAnalyzed',
} as const;

export type StatusFilter = (typeof StatusFilter)[keyof typeof StatusFilter];

export const ResultStatus = {
    HIT_RED: 'HIT-RED',
    HIT_YELLOW: 'HIT-YELLOW',
    NO_HIT_YELLOW: 'NO-HIT-YELLOW',
    NO_HIT_GREEN: 'NO-HIT-GREEN',
    NOT_RELEVANT: 'NOT-RELEVANT',
    NOT_IMPLEMENTED: 'NOT-IMPLEMENTED',
    TIMEOUT: 'TIMEOUT',
    ERROR: 'ERROR',
} as const satisfies Record<string, ResultStatusValue>;
