import { api, useGetDokTemaQuery } from '@/lib/api/api';
import AreaDialog from '../AreaDialog/AreaDialog';
import { apiFetch } from '@/app/apiFetch';
import {
    analyzeStart,
    analyzeFinish,
    setFormData,
    type FormDataField,
} from '@/app/appSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createPayload, mapResponse } from './Form.helpers';
import { resetProgress } from '@/features/analysis-progress/progressSlice';
import {
    setResponse,
    resetResponseState,
} from '@/features/analysis-response/responseSlice';
import {
    Button,
    Checkbox,
    Field,
    Input,
    Label,
    Select,
} from 'dibk-designsystemet';
import { CheckmarkCircleFillIcon } from '@navikt/aksel-icons';
import styles from './Form.module.scss';

import type { CrsGeometry } from '@/types/geo.types';
import type { ChangeEvent } from 'react';

export default function Form() {
    const correlationId = useAppSelector((state) => state.app.correlationId);
    const formData = useAppSelector((state) => state.app.formData);
    const busy = useAppSelector((state) => state.app.busy);
    const { data: themes = [] } = useGetDokTemaQuery();
    const dispatch = useAppDispatch();

    function handleChange(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) {
        const name = event.target.name;

        const value =
            event.target.type === 'checkbox'
                ? (event.target as HTMLInputElement).checked
                : event.target.value;
        dispatch(setFormData({ name, value } as FormDataField));
    }

    function handleAreaDialogOk(geometry: CrsGeometry | null) {
        dispatch(setFormData({ name: 'inputGeometry', value: geometry }));
    }

    function canSubmit() {
        return !busy && formData.inputGeometry !== null;
    }

    function resetState() {
        dispatch(resetResponseState());
        dispatch(resetProgress());
    }

    async function runAnalyses() {
        resetState();

        const payload = createPayload(formData, correlationId);

        try {
            dispatch(analyzeStart());

            const response = await apiFetch(api.endpoints.analyze, { payload });
            const mapped = mapResponse(response);
            dispatch(setResponse(mapped));
        } catch (error) {
            console.log(error);
        } finally {
            setTimeout(() => {
                dispatch(analyzeFinish());
            }, 500);
        }
    }

    return (
        <section className={styles.form}>
            <div className={styles.input}>
                <div className={styles.row}>
                    <div className={styles.addGeometry}>
                        <AreaDialog onOk={handleAreaDialogOk} />

                        <CheckmarkCircleFillIcon
                            color="#056d13"
                            fontSize="24px"
                            style={{
                                visibility:
                                    formData.inputGeometry !== null
                                        ? 'visible'
                                        : 'hidden',
                            }}
                        />
                    </div>

                    <Field className={styles.buffer}>
                        <Label>Buffer</Label>
                        <Field.Affixes>
                            <Input
                                type="number"
                                name="requestedBuffer"
                                value={formData.requestedBuffer}
                                onChange={handleChange}
                            />
                            <Field.Affix>meter</Field.Affix>
                        </Field.Affixes>
                    </Field>

                    <Field>
                        <Label>Bruksområde</Label>
                        <Select
                            name="context"
                            value={formData.context}
                            onChange={handleChange}
                        >
                            <Select.Option value="">
                                Velg bruksområde
                            </Select.Option>
                            <Select.Option value="Reguleringsplan">
                                Reguleringsplan
                            </Select.Option>
                            <Select.Option value="Kommuneplan">
                                Kommuneplan
                            </Select.Option>
                            <Select.Option value="Byggesak">
                                Byggesak
                            </Select.Option>
                        </Select>
                    </Field>

                    <Field>
                        <Label>Tema</Label>
                        <Select
                            name="theme"
                            value={formData.theme}
                            onChange={handleChange}
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
                        </Select>
                    </Field>

                    <div className={styles.checkboxes}>
                        <Checkbox
                            name="includeGuidance"
                            checked={formData.includeGuidance}
                            onChange={handleChange}
                            label="Inkluder veiledning"
                        />

                        <Checkbox
                            name="includeFilterChosenDOK"
                            checked={formData.includeFilterChosenDOK}
                            onChange={handleChange}
                            label="Inkluder kun kommunens valgte DOK-data"
                        />

                        <Checkbox
                            name="includeQualityMeasurement"
                            checked={formData.includeQualityMeasurement}
                            onChange={handleChange}
                            label="Inkluder kvalitetsinformasjon"
                        />

                        <Checkbox
                            name="createBinaries"
                            checked={formData.createBinaries}
                            onChange={handleChange}
                            label="Lag kartbilder og PDF-rapport"
                        />

                        <Checkbox
                            name="includeFacts"
                            checked={formData.includeFacts}
                            onChange={handleChange}
                            label="Inkluder faktainformasjon"
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.submit}>
                        <Button
                            onClick={runAnalyses}
                            variant="primary"
                            disabled={!canSubmit()}
                        >
                            Start DOK-analyse
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
