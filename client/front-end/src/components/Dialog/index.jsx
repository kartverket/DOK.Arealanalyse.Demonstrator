import { useEffect } from 'react';
import { Dialog as DsDialog } from '@digdir/designsystemet-react';
import styles from './Dialog.module.scss';

export default function Dialog({ children, modal = true, ...props }) {
    useEffect(
        () => {
            if (!modal) {
                return;
            }

            if (props.open) {
                document.documentElement.classList.add('no-scroll');
            } else {
                document.documentElement.classList.remove('no-scroll')
            }
        },
        [props.open]
    );

    function renderModal() {
        return (
            <div
                className={styles.backdrop}
                style={{ display: props.open ? 'flex' : 'none' }}
            >
                {renderDialog()}
            </div>
        );
    }

    function renderDialog() {
        return (
            <DsDialog
                {...props}
                modal={false}
                className={`${props.className || ''} ${styles.dialog}`}
            >
                {children}
            </DsDialog>
        );
    }

    return modal ? renderModal() : renderDialog();
}