import type { ReactNode } from 'react';
import AreaSelector from '../AreaSelector/AreaSelector';
import Form from '../Form/Form';

export default function AnalysisInput() {
    function handleAreaSelected(_title: ReactNode) {}

    return (
        <>
            <AreaSelector onAreaSelected={handleAreaSelected} />
            <Form />
        </>
    );
}
