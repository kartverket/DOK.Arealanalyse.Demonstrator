import { useSelector } from 'react-redux';
import { Dialog } from 'components';
import Progress from './Progress';
import styles from './ProgressDialog.module.scss';

export default function ProgressDialog() {
    const busy = useSelector(state => state.app.busy);

    return (
        <Dialog
            open={busy}
            closeButton={false}
            className={styles.progressDialog}
        >
            {busy && <Progress />}
        </Dialog>
    )
}