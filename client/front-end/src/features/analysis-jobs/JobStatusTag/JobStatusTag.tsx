import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '../constants';
import { Tag } from 'dibk-designsystemet';
import {
    ArrowsCirclepathIcon,
    CheckmarkCircleIcon,
    HourglassIcon,
    MinusCircleIcon,
    XMarkOctagonIcon,
} from '@navikt/aksel-icons';
import styles from './JobStatusTag.module.scss';

import type { JobStatus } from '@/types/api.types';

const ICONS = {
    accepted: HourglassIcon,
    running: ArrowsCirclepathIcon,
    successful: CheckmarkCircleIcon,
    failed: XMarkOctagonIcon,
    dismissed: MinusCircleIcon,
} as const satisfies Record<JobStatus, unknown>;

interface JobStatusTagProps {
    status: JobStatus;
}

export default function JobStatusTag({ status }: JobStatusTagProps) {
    const Icon = ICONS[status];

    return (
        <Tag
            data-color={JOB_STATUS_COLORS[status]}
            data-size="sm"
            className={styles.jobStatusTag}
        >
            <Icon aria-hidden />
            {JOB_STATUS_LABELS[status]}
        </Tag>
    );
}
