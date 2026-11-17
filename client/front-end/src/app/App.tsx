import { Outlet } from 'react-router';
import useSocketIO from '@/lib/socket/useSocketIO';
import { PATHS } from './paths';
import messageHandlers, {
    handleDisconnect,
} from '@/features/analysis-progress/messageHandlers';
import RouterLink from '@/components/RouterLink/RouterLink';
import Toaster from '@/components/Toaster/Toaster';
import { DibkAppShell } from 'dibk-designsystemet';

const SHORTCUTS = [
    { label: 'Analyse', href: PATHS.analysis },
    { label: 'Tjenestestatus', href: PATHS.status },
];

export default function App() {
    // Kobles til her, så correlationId og fremdriften beholdes når brukeren navigerer
    useSocketIO(messageHandlers, handleDisconnect);

    return (
        <DibkAppShell
            search={false}
            title="Arealanalyse av DOK-datasett - Demonstrator"
            homeHref={PATHS.analysis}
            shortcuts={SHORTCUTS}
            linkComponent={RouterLink}
        >
            <Outlet />
            <Toaster />
        </DibkAppShell>
    );
}
