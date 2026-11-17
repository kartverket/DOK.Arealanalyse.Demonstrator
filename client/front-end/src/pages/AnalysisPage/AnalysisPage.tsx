import AnalysisInput from '@/features/analysis-input/AnalysisInput/AnalysisInput';
import JobList from '@/features/analysis-jobs/JobList/JobList';
import ProgressDialog from '@/features/analysis-progress/ProgressDialog/ProgressDialog';

export default function AnalysisPage() {
    return (
        <>
            <AnalysisInput />
            <JobList />
            <ProgressDialog />
        </>
    );
}
