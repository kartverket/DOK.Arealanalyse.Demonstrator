import useSocketIO from '@/lib/socket/useSocketIO';
import { useAppSelector } from './hooks';
import Form from '@/features/analysis-input/Form/Form';
import messageHandlers, {
    handleDisconnect,
} from '@/features/analysis-progress/messageHandlers';
import ProgressDialog from '@/features/analysis-progress/ProgressDialog/ProgressDialog';
import Drawer from '@/features/analysis-response/Drawer/Drawer';
import MapDialog from '@/features/analysis-response/MapDialog/MapDialog';
import Response from '@/features/analysis-response/Response/Response';
import FactInfo from '@/features/fact-info/FactInfo/FactInfo';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import Heading from '@/components/Heading/Heading';
import Toaster from '@/components/Toaster/Toaster';
import styles from './App.module.scss';

export default function App() {
    useSocketIO(messageHandlers, handleDisconnect);

    const analysisId = useAppSelector((state) => state.app.analysisId);

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
