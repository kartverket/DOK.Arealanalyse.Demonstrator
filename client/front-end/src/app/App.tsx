import { useAppSelector } from './hooks';
import useSocketIO from '@/lib/socket/useSocketIO';
import messageHandlers from '@/features/analysis-progress/messageHandlers';
import Form from '@/features/analysis-input/Form/Form';
import Response from '@/features/analysis-response/Response/Response';
import Drawer from '@/features/analysis-response/Drawer/Drawer';
import MapDialog from '@/features/analysis-response/MapDialog/MapDialog';
import FactInfo from '@/features/fact-info/FactInfo/FactInfo';
import ProgressDialog from '@/features/analysis-progress/ProgressDialog/ProgressDialog';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import Heading from '@/components/Heading/Heading';
import Toaster from '@/components/Toaster/Toaster';
import styles from './App.module.scss';

export default function App() {
    useSocketIO(messageHandlers);
    const analysisId = useAppSelector(state => state.app.analysisId);

    return (
        <div className={styles.app}>
            <Heading />

            <div className={styles.content}>
                <ErrorBoundary>
                    <Form />
                    <Response key={analysisId} />
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
