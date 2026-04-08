import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setErrorMessage, setToast } from 'store/slices/appSlice';
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
                }, 3000);
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

    // return <ToastContainer autoClose={600000} closeButton={false} />

}

// function ToastComponent() {
//     return (
//         <Alert data-color='danger'>
//             {/* <Heading
//                 level={2}
//                 data-size='xs'
//                 style={{
//                     marginBottom: 'var(--ds-size-2)',
//                 }}
//             >
//                 Det har skjedd en feil
//             </Heading> */}
//             <Paragraph>Det har skjedd en feil</Paragraph>
//         </Alert>
//     )
// }