import Progress from './Progress/Progress';
import Dialog from '@/components/Dialog/Dialog';
import styles from './ProgressDialog.module.scss';

import type { AnalysisJob } from '@/types/api.types';

interface ProgressDialogProps {
    open: boolean;

    // Brukes når det ikke kommer fremdrift fra Socket.IO
    job?: AnalysisJob;
    fetchingResults?: boolean;
}

export default function ProgressDialog({
    open,
    job,
    fetchingResults = false,
}: ProgressDialogProps) {
    return (
        <Dialog
            open={open}
            closeButton={false}
            className={styles.progressDialog}
            aria-label="Status"
        >
            {open && (
                <Progress
                    job={job}
                    fetchingResults={fetchingResults}
                />
            )}
        </Dialog>
    );
}
