import { Form, Response, Drawer, MapDialog, FactInfo } from 'features';
import { Heading, Toaster } from 'components';
import { useSocketIO } from 'hooks';
import messageHandlers from 'utils/messageHandlers';
import styles from './App.module.scss';

export default function App() {
    useSocketIO(messageHandlers);

    return (
        <div className={styles.app}>
            <Heading />

            <div className={styles.content}>
                <Form />
                <Response />
                <Drawer />
                <MapDialog />
                <FactInfo />
                <Toaster />


                {/* <dialog id="my-dialog" open>
                    <p>This dialog was opened using an invoker command.</p>
                    <button commandfor="my-dialog" command="close">Close</button>
                </dialog> */}
            </div>
        </div>
    );
}
