import { JOB_UNAVAILABLE_TEXTS } from '../constants';
import JobStatusTag from '../JobStatusTag/JobStatusTag';
import { Dialog, Heading, Paragraph } from 'dibk-designsystemet';
import styles from './JobStatusDialog.module.scss';

import type { AnalysisJob } from '@/types/api.types';

interface JobStatusDialogProps {
    // Analysen brukeren valgte i tabellen, hvis den ikke er fullført
    job: AnalysisJob | null;
    onClose: () => void;
}

export default function JobStatusDialog({
    job,
    onClose,
}: JobStatusDialogProps) {
    return (
        <Dialog
            open={job !== null}
            onClose={onClose}
            closedby="any"
            closeButton="Lukk"
            className={styles.dialog}
        >
            {job && job.status !== 'successful' && (
                <div className={styles.content}>
                    <Heading
                        level={2}
                        data-size="xs"
                    >
                        Resultatet kan ikke vises
                    </Heading>
                    <JobStatusTag status={job.status} />
                    <Paragraph>{JOB_UNAVAILABLE_TEXTS[job.status]}</Paragraph>
                    {job.message && (
                        <Paragraph data-size="sm">{job.message}</Paragraph>
                    )}
                    <Paragraph
                        data-size="sm"
                        className={styles.jobId}
                    >
                        {job.jobID}
                    </Paragraph>
                </div>
            )}
        </Dialog>
    );
}
