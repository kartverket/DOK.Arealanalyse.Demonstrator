import { useCallback, useEffect } from 'react';
import { setToast } from '@/app/appSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import Dialog from '@/components/Dialog/Dialog';
import { Alert } from 'dibk-designsystemet';
import styles from './Toaster.module.scss';

export default function Toaster() {
    const toast = useAppSelector((state) => state.app.toast);
    const dispatch = useAppDispatch();

    const handleClose = useCallback(() => {
        dispatch(setToast(null));
    }, [dispatch]);

    useEffect(() => {
        if (toast !== null) {
            setTimeout(() => {
                handleClose();
            }, 5000);
        }
    }, [toast, handleClose]);

    return (
        <Dialog
            open={toast !== null}
            onClose={handleClose}
            placement="right"
            modal={false}
            className={styles.toaster}
        >
            {toast !== null && (
                <Alert
                    data-color={toast.type}
                    className={styles.alert}
                >
                    {toast.message}
                </Alert>
            )}
        </Dialog>
    );
}
