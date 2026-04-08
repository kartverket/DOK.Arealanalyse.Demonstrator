import { useSocketIO } from 'hooks';
import messageHandlers from 'utils/messageHandlers';
import { Form, Response, Drawer, MapDialog, FactInfo, ProgressDialog } from 'features';
import { Heading, Toaster } from 'components';
import styles from './App.module.scss';
import { useSelector } from 'react-redux';

export default function App() {
    useSocketIO(messageHandlers);
    const analyzisId = useSelector(state => state.app.analyzisId);

    return (
        <div className={styles.app}>
            <Heading />

            <div className={styles.content}>
                <Form />
                <Response key={analyzisId} />
                <Drawer />
                <MapDialog />
                <ProgressDialog />
                <FactInfo />
                <Toaster />
            </div>
        </div>
    );
}
