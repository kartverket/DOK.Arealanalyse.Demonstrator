import { Form, Response, Drawer } from 'features';
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
                <Toaster />
            </div>
        </div>
    );
}
