import { useMemo, type ChangeEvent } from 'react';
import { useGetKommunerQuery } from '@/lib/api/api';
import AreaSuggestion from './AreaSuggestion/AreaSuggestion';
import { setSearchKommunenummer } from '@/app/appSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Field, Label, Select } from 'dibk-designsystemet';
import styles from './AreaSearch.module.scss';

interface AreaSearchProps {
    kommunenummer: string | null;
}

export default function AreaSearch({ kommunenummer }: AreaSearchProps) {
    const searchKommunenummer = useAppSelector(
        (state) => state.app.searchKommunenummer,
    );
    const dispatch = useAppDispatch();

    // Kommunen der brukeren er, brukes til brukeren selv har valgt en kommune
    const selectedKommune = searchKommunenummer ?? kommunenummer ?? '';
    const { data = null } = useGetKommunerQuery();

    const kommuner = useMemo(() => {
        if (data === null) {
            return [];
        }

        return data.features.map(({ properties }) => ({
            value: properties.kommunenummer,
            label: `${properties.kommunenavn} (${properties.kommunenummer})`,
        }));
    }, [data]);

    function handleKommuneChange(event: ChangeEvent<HTMLSelectElement>) {
        dispatch(setSearchKommunenummer(event.target.value));
    }

    return (
        <div className={styles.search}>
            <Field>
                <Label>Kommune</Label>
                <Select
                    value={selectedKommune}
                    onChange={handleKommuneChange}
                >
                    <Select.Option value="">Velg kommune</Select.Option>
                    {kommuner.map((kommune) => (
                        <Select.Option
                            key={kommune.value}
                            value={kommune.value}
                        >
                            {kommune.label}
                        </Select.Option>
                    ))}
                </Select>
            </Field>

            <Field style={{ width: 250 }}>
                <Label>Plan-ID, matrikkelnr. eller adresse</Label>

                <AreaSuggestion kommunenummer={selectedKommune} />
            </Field>
        </div>
    );
}
