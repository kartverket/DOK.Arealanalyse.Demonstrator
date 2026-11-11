import Progress from './Progress/Progress';
import { useAppSelector } from '@/app/hooks';
import Dialog from '@/components/Dialog/Dialog';
import styles from './ProgressDialog.module.scss';

export default function ProgressDialog() {
    const busy = useAppSelector((state) => state.app.busy);
    return (
        <Dialog
            open={busy}
            closeButton={false}
            className={styles.progressDialog}
            aria-label="Status"
        >
            {busy && <Progress />}
        </Dialog>
    );
}
