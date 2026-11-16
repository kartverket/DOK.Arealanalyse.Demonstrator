import { useGetDokTemaQuery } from '@/lib/api/api';
import BufferField from './BufferField/BufferField';
import CheckboxField from './CheckboxField/CheckboxField';
import SelectField from './SelectField/SelectField';
import useRunAnalysis from './useRunAnalysis';
import { useAppSelector } from '@/app/hooks';
import { Button, Select } from 'dibk-designsystemet';
import styles from './Form.module.scss';

export default function Form() {
    const busy = useAppSelector((state) => state.app.busy);
    const hasGeometry = useAppSelector(
        (state) => state.app.formData.inputGeometry !== null,
    );
    const { data: themes = [] } = useGetDokTemaQuery();
    const runAnalysis = useRunAnalysis();

    return (
        <section className={styles.form}>
            <BufferField />

            <SelectField
                name="context"
                label="Bruksområde"
            >
                <Select.Option value="">Velg bruksområde</Select.Option>
                <Select.Option value="Reguleringsplan">
                    Reguleringsplan
                </Select.Option>
                <Select.Option value="Kommuneplan">Kommuneplan</Select.Option>
                <Select.Option value="Byggesak">Byggesak</Select.Option>
            </SelectField>

            <SelectField
                name="theme"
                label="Tema"
            >
                <Select.Option value="">Velg tema</Select.Option>
                {themes.map((theme) => (
                    <Select.Option
                        key={theme}
                        value={theme}
                    >
                        {theme}
                    </Select.Option>
                ))}
            </SelectField>

            <div className={styles.checkboxes}>
                <CheckboxField
                    name="includeGuidance"
                    label="Inkluder veiledning"
                />
                <CheckboxField
                    name="includeQualityMeasurement"
                    label="Inkluder kvalitetsinformasjon"
                />
                <CheckboxField
                    name="includeFacts"
                    label="Inkluder faktainformasjon"
                />
                <CheckboxField
                    name="includeFilterChosenDOK"
                    label="Inkluder kun kommunens valgte DOK-data"
                />
                <CheckboxField
                    name="createBinaries"
                    label="Lag kartbilder og PDF-rapport"
                />
            </div>

            <div className={styles.submit}>
                <Button
                    onClick={runAnalysis}
                    variant="primary"
                    disabled={busy || !hasGeometry}
                >
                    Start DOK-analyse
                </Button>

                <CheckboxField
                    name="respondAsync"
                    label="Kjør asynkront"
                />
            </div>
        </section>
    );
}
