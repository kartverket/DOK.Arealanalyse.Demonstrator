import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Tag } from 'dibk-designsystemet';
import {
    CheckmarkCircleIcon,
    ClockIcon,
    ExclamationmarkTriangleIcon,
    XMarkOctagonIcon,
} from '@navikt/aksel-icons';
import styles from './StatusTag.module.scss';

import type { HealthStatus } from '@/types/health.types';

const ICONS = {
    ok: CheckmarkCircleIcon,
    slow: ClockIcon,
    degraded: ExclamationmarkTriangleIcon,
    down: XMarkOctagonIcon,
} as const satisfies Record<HealthStatus, unknown>;

interface StatusTagProps {
    status: HealthStatus;
}

export default function StatusTag({ status }: StatusTagProps) {
    const Icon = ICONS[status];

    return (
        <Tag
            data-color={STATUS_COLORS[status]}
            data-size="sm"
            className={styles.statusTag}
        >
            <Icon aria-hidden />
            {STATUS_LABELS[status]}
        </Tag>
    );
}
