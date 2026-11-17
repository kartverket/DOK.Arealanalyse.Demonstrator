import { useAppSelector } from '@/app/hooks';
import AnalysisInput from '@/features/analysis-input/AnalysisInput/AnalysisInput';
import JobList from '@/features/analysis-jobs/JobList/JobList';
import ProgressDialog from '@/features/analysis-progress/ProgressDialog/ProgressDialog';

export default function AnalysisPage() {
    return (
        <>
            <AnalysisInput />
            <JobList />
            <StartProgressDialog />
        </>
    );
}

// Vises til jobId er kjent og brukeren er sendt til siden for analysen.
// Egen komponent, så resten av siden ikke rendres på nytt når den åpnes og lukkes.
function StartProgressDialog() {
    const open = useAppSelector(
        (state) => state.app.busy && state.progress.jobId === null,
    );
    return <ProgressDialog open={open} />;
}
