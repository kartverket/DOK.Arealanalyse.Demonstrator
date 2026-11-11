import { useEffect, type ComponentPropsWithRef } from 'react';
import { Dialog as DsDialog } from '@digdir/designsystemet-react';
import styles from './Dialog.module.scss';

type DialogProps = ComponentPropsWithRef<typeof DsDialog>;

export default function Dialog({ children, modal = true, ...props }: DialogProps) {
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
        [modal, props.open]
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