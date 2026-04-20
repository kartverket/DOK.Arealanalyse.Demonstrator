import { useMemo, useState } from 'react';
import { useGetKommunerQuery } from 'store/api';
import { useCurrentLocation } from 'hooks';
import { Field, Label, Select } from '@digdir/designsystemet-react';
import Suggestion from './Suggestion';
import styles from './Search.module.scss';

export default function Search({ onResponse }) {
    const { data = null } = useGetKommunerQuery();
    const [selectedKommunenummer, setSelectedKommunenummer] = useState(null);
    const { kommunenummer: currentKommunenummer } = useCurrentLocation();
    const kommunenummer = selectedKommunenummer || currentKommunenummer || '';

    const kommuner = useMemo(
        () => {
            if (data === null) {
                return [];
            }

            return data.features
                .map(({ properties }) => ({
                    value: properties.kommunenummer,
                    label: `${properties.kommunenavn} (${properties.kommunenummer})`
                }));
        },
        [data]
    );

    return (
        <div className={styles.search}>
            <Field>
                <Label>Kommune</Label>

                <Select
                    value={kommunenummer}
                    onChange={event => setSelectedKommunenummer(event.target.value)}
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
                    kommunenummer={kommunenummer}
                    onSelected={onResponse}
                />
            </Field>
        </div>
    )
}