import useCurrentLocation from '@/hooks/useCurrentLocation';
import AreaPreview from '../AreaPreview/AreaPreview';
import AreaSelector from '../AreaSelector/AreaSelector';
import Form from '../Form/Form';
import styles from './AnalysisInput.module.scss';

export default function AnalysisInput() {
    // Hentes her, så posisjonen bare slås opp én gang
    const { kommunenummer, coordinates } = useCurrentLocation();

    return (
        <section className={styles.analysisInput}>
            <AreaSelector
                kommunenummer={kommunenummer}
                currentLocation={coordinates}
            />
            <AreaPreview currentLocation={coordinates} />
            <Form />
        </section>
    );
}
