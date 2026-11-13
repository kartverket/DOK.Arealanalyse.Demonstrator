import { useRef, useState, type InputEvent, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { api } from '@/lib/api/api';
import { debounce } from '@/lib/helpers';
import { apiFetch } from '@/app/apiFetch';
import { setFormData } from '@/app/appSlice';
import { fetchArea } from './Suggestion.helpers';
import {
    EXPERIMENTAL_Suggestion as DsSuggestion,
    type SuggestionItem,
} from 'dibk-designsystemet';
import styles from './Suggestion.module.scss';

import type { SearchFeature } from '@/types/api.types';
import type { CrsGeometry } from '@/types/geo.types';

interface SuggestionProps {
    kommunenummer: string;
    onSelected: (geometry: CrsGeometry, title: string) => void;
}

export default function Suggestion({
    kommunenummer,
    onSelected,
}: SuggestionProps) {
    const [suggestions, setSuggestions] = useState<SearchFeature[]>([]);
    const [selected, setSelected] = useState('');
    const suggestionInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();

    const handleSuggestionInput = debounce(
        async (event: InputEvent<HTMLInputElement>) => {
            const query = (event.target as HTMLInputElement).value.trim();
            if (query.length < 3) {
                return;
            }

            try {
                const response = await apiFetch(api.endpoints.search, {
                    kommunenummer,
                    query,
                });
                setSuggestions(response.features);
            } catch (error) {
                console.log(error);
            }
        },
        500,
    );

    function resetSuggestion() {
        setSelected('');
        setSuggestions([]);
        dispatch(setFormData({ name: 'inputGeometry', value: null }));
    }

    function getAreaTitle(feature: SearchFeature): ReactNode {
        const props = feature.properties;

        switch (props.type) {
            case 'Eiendom':
                return `${props.data.matrikkelnummer}, ${props.data.postnummer} ${props.data.poststed}`;
            case 'Vegadresse':
                return `Eiendom ${props.data.matrikkelnummer} (${props.data.adressetekst}, ${props.data.postnummer} ${props.data.poststed})`;
            case 'Reguleringsplan':
            case 'Reguleringsplanforslag': {
                return (
                    <>
                        <span>{props.type}</span>
                        <span>{props.data.planId} {props.data.plannavn !== null && `: ${props.data.plannavn}`}</span>
                        <span>{props.data.kommunenavn} ({props.data.kommunenummer})</span>
                    </>
                )
            }
        }
    }


    async function handleSuggestionChange(item: SuggestionItem | null) {
        if (item === null) {
            resetSuggestion();
            return;
        }

        if (suggestionInputRef.current !== null) {
            suggestionInputRef.current.value = '';
        }

        const id = parseInt(item.value);
        const feature = suggestions.find((suggestion) => suggestion.id === id);
        if (feature === undefined) {
            return;
        }

        setSelected(item.label);

        try {
            const geometry = await fetchArea(kommunenummer, feature);
            if (geometry !== null) {
                onSelected(geometry, getAreaTitle(feature));
            }
        } catch (error) {
            console.log(error);
        }
    }

    function renderLabel(feature: SearchFeature) {
        const props = feature.properties;
        const type = props.type;

        switch (props.type) {
            case 'Eiendom':
                return (
                    <>
                        <span>{props.data.matrikkelnummer}</span>
                        <span className={styles.type}>{type}</span>
                    </>
                );
            case 'Vegadresse':
                return (
                    <>
                        <span>{props.data.adressetekst}</span>
                        <span className={styles.subTitle}>
                            {props.data.matrikkelnummer}
                        </span>
                        <span className={styles.type}>{type}</span>
                    </>
                );
            case 'Reguleringsplan':
            case 'Reguleringsplanforslag':
                return (
                    <>
                        <span>{props.data.planId}</span>
                        <span className={styles.type}>{type}</span>
                    </>
                );
            default:
                return null;
        }
    }

    return (
        <DsSuggestion
            selected={selected}
            onSelectedChange={handleSuggestionChange}
            filter={() => true}
        >
            <DsSuggestion.Input
                ref={suggestionInputRef}
                onInput={handleSuggestionInput}
                disabled={kommunenummer === ''}
            />

            <DsSuggestion.Toggle disabled={kommunenummer === ''} />
            <DsSuggestion.Clear disabled={kommunenummer === ''} />

            <DsSuggestion.List className={styles.list}>
                <DsSuggestion.Empty>Ingen treff</DsSuggestion.Empty>

                <div className={styles.innerList}>
                    {suggestions.map((feature) => (
                        <DsSuggestion.Option
                            key={feature.id}
                            value={feature.id}
                            label={feature.properties.value}
                        >
                            <div className={styles.label}>
                                {renderLabel(feature)}
                            </div>
                        </DsSuggestion.Option>
                    ))}
                </div>
            </DsSuggestion.List>
        </DsSuggestion>
    );
}
