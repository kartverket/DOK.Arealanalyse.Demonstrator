import useSocketIO from '@/lib/socket/useSocketIO';
import { useAppSelector } from '@/app/hooks';
import AreaSelector from '@/features/analysis-input/AreaSelector/AreaSelector';
import Form from '@/features/analysis-input/Form/Form';
import messageHandlers, {
    handleDisconnect,
} from '@/features/analysis-progress/messageHandlers';
import ProgressDialog from '@/features/analysis-progress/ProgressDialog/ProgressDialog';
import Drawer from '@/features/analysis-response/Drawer/Drawer';
import MapDialog from '@/features/analysis-response/MapDialog/MapDialog';
import Response from '@/features/analysis-response/Response/Response';
import FactInfo from '@/features/fact-info/FactInfo/FactInfo';

export default function AnalysisPage() {
    useSocketIO(messageHandlers, handleDisconnect);

    const analysisId = useAppSelector((state) => state.app.analysisId);

    return (
        <>
            <AreaSelector />
            <Form />
            <Response key={analysisId} />
            <Drawer />
            <MapDialog />
            <ProgressDialog />
            <FactInfo />
        </>
    );
}
