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
import StatusPage from '@/features/service-health/StatusPage/StatusPage';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import Toaster from '@/components/Toaster/Toaster';
import { DibkAppShell } from 'dibk-designsystemet';

const STATUS_PATH = '/status';

const SHORTCUTS = [
    { label: 'Analyse', href: '/' },
    { label: 'Tjenestestatus', href: STATUS_PATH },
];

export default function App() {
    const isStatusPage =
        window.location.pathname.replace(/\/+$/, '') === STATUS_PATH;

    return (
        <DibkAppShell
            search={false}
            title="Arealanalyse av DOK-datasett - Demonstrator"
            shortcuts={SHORTCUTS}
        >
            <ErrorBoundary>
                {isStatusPage ? <StatusPage /> : <Analysis />}
                <Toaster />
            </ErrorBoundary>
        </DibkAppShell>
    );
}

function Analysis() {
    useSocketIO(messageHandlers, handleDisconnect);

    const analysisId = useAppSelector((state) => state.app.analysisId);

    return (
        <>
            <Form />
            <Response key={analysisId} />
            <Drawer />
            <MapDialog />
            <ProgressDialog />
            <FactInfo />
        </>
    );
}
