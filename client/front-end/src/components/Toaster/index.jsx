import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setToast } from 'store/slices/appSlice';
import { Alert } from '@digdir/designsystemet-react';
import { Dialog } from 'components';
import styles from './Toaster.module.scss';

export default function Toaster() {
    const toast = useSelector(state => state.app.toast);
    const dispatch = useDispatch();

    const handleClose = useCallback(
        () => {
            dispatch(setToast(null));
        },
        [dispatch]
    );

    useEffect(
        () => {
            if (toast !== null) {
                setTimeout(() => {
                    handleClose();
                }, 5000);
            }
        },
        [toast, handleClose]
    );

    return (
        <Dialog
            open={toast !== null}
            onClose={handleClose}
            placement="right"
            modal={false}
            className={styles.toaster}
        >
            {
                toast !== null && (
                    <Alert
                        data-color={toast.type}
                        className={styles.alert}
                    >
                        {toast.message}
                    </Alert>
                )
            }
        </Dialog>
    );
}
