import { Outlet } from 'react-router';
import { PATHS } from './paths';
import RouterLink from '@/components/RouterLink/RouterLink';
import Toaster from '@/components/Toaster/Toaster';
import { DibkAppShell } from 'dibk-designsystemet';

const SHORTCUTS = [
    { label: 'Analyse', href: PATHS.analysis },
    { label: 'Resultater', href: PATHS.results },
    { label: 'Tjenestestatus', href: PATHS.status },
];

export default function App() {
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
