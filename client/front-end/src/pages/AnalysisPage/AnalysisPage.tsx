import useSocketIO from '@/lib/socket/useSocketIO';
import AreaSelector from '@/features/analysis-input/AreaSelector/AreaSelector';
import messageHandlers, {
    handleDisconnect,
} from '@/features/analysis-progress/messageHandlers';
import ProgressDialog from '@/features/analysis-progress/ProgressDialog/ProgressDialog';

export default function AnalysisPage() {
    useSocketIO(messageHandlers, handleDisconnect);

    return (
        <>
            <AreaSelector />
            {/* <Form /> */}
            <ProgressDialog />
        </>
    );
}
