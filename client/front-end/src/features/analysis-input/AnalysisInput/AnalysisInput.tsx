import AreaSelector from '../AreaSelector/AreaSelector';
import Form from '../Form/Form';

export default function AnalysisInput() {
    function handleAreaSelected(_title: string) {}

    return (
        <>
            <AreaSelector onAreaSelected={handleAreaSelected} />
            <Form />
        </>
    );
}
