import useSocketIO from '@/lib/socket/useSocketIO';
import AnalysisInput from '@/features/analysis-input/AnalysisInput/AnalysisInput';
import JobList from '@/features/analysis-jobs/JobList/JobList';
import messageHandlers, {
    handleDisconnect,
} from '@/features/analysis-progress/messageHandlers';
import ProgressDialog from '@/features/analysis-progress/ProgressDialog/ProgressDialog';

export default function AnalysisPage() {
    useSocketIO(messageHandlers, handleDisconnect);
    return (
        <>
            <AnalysisInput />
            <JobList />
            <ProgressDialog />
        </>
    );
}
