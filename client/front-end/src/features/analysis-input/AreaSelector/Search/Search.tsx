import { useMemo, useState, type ChangeEvent } from 'react';
import { useGetKommunerQuery } from '@/lib/api/api';
import Suggestion from './Suggestion/Suggestion';
import { Field, Label, Select } from 'dibk-designsystemet';
import styles from './Search.module.scss';

import type { CrsGeometry } from '@/types/geo.types';

interface SearchProps {
    onResponse: (geometry: CrsGeometry, title: string) => void;
    kommunenummer: string | null;
}

export default function Search({ onResponse, kommunenummer }: SearchProps) {
    const [selectedKommune, setSelectedKommune] = useState(kommunenummer ?? '');
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

    async function handleKommuneChange(event: ChangeEvent<HTMLSelectElement>) {
        const kommunenummer = event.target.value;
        setSelectedKommune(kommunenummer);
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

                <Suggestion
                    kommunenummer={selectedKommune}
                    onSelected={onResponse}
                />
            </Field>
        </div>
    );
}
