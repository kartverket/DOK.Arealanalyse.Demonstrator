import { useMemo, useState } from 'react';
import { useGetKommunerQuery } from 'store/api';
import { Field, Label, Select } from '@digdir/designsystemet-react';
import Suggestion from './Suggestion';
import styles from './Search.module.scss';

export default function Search({ onResponse, kommunenummer }) {
    const [selectedKommune, setSelectedKommune] = useState(kommunenummer ?? '');
    const { data = null } = useGetKommunerQuery();    

    const kommuner = useMemo(
        () => {
            if (data === null) {
                return [];
            }

            return data.features.map(({ properties }) => ({
                value: properties.kommunenummer,
                label: `${properties.kommunenavn} (${properties.kommunenummer})`
            }))
        },
        [data]
    )

    async function handleKommuneChange(event) {
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
                    {
                        kommuner.map(kommune => (
                            <Select.Option
                                key={kommune.value}
                                value={kommune.value}
                            >
                                {kommune.label}
                            </Select.Option>
                        ))
                    }
                </Select>
            </Field>

            <Field>
                <Label>Plan-ID, matrikkelnummer eller adresse</Label>

                <Suggestion
                    kommunenummer={selectedKommune}
                    onSelected={onResponse}
                />
            </Field>
        </div>
    )
}