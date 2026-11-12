import { createBrowserRouter } from 'react-router';
import App from './App';
import { PATHS } from './paths';
import AnalysisPage from '@/pages/AnalysisPage/AnalysisPage';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';
import StatusPage from '@/features/service-health/StatusPage/StatusPage';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';

const router = createBrowserRouter([
    {
        path: PATHS.analysis,
        Component: App,
        ErrorBoundary,
        children: [
            {
                ErrorBoundary,
                children: [
                    { index: true, Component: AnalysisPage },
                    { path: PATHS.status, Component: StatusPage },
                    { path: '*', Component: NotFoundPage },
                ],
            },
        ],
    },
]);

export default router;
