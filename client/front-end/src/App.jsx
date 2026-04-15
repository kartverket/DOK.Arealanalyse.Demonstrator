import { useSelector } from 'react-redux';
import { useSocketIO } from 'hooks';
import messageHandlers from 'utils/messageHandlers';
import { Form, Response, Drawer, MapDialog, FactInfo, ProgressDialog } from 'features';
import { ErrorBoundary, Heading, Toaster } from 'components';
import styles from './App.module.scss';

export default function App() {
    useSocketIO(messageHandlers);
    const analyzisId = useSelector(state => state.app.analyzisId);

    return (
        <div className={styles.app}>
            <Heading />

            <div className={styles.content}>
                <ErrorBoundary>
                    <Form />
                    <Response key={analyzisId} />
                    <Drawer />
                    <MapDialog />
                    <ProgressDialog />
                    <FactInfo />
                    <Toaster />
                </ErrorBoundary>
            </div>
        </div>
    );
}
