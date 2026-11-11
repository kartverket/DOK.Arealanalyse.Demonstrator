import { EXPERIMENTAL_Suggestion as DsSuggestion, type SuggestionItem } from '@digdir/designsystemet-react';
import { useRef, useState, type FormEvent } from 'react';
import { api } from '@/lib/api/api';
import { apiFetch } from '@/app/apiFetch';
import { debounce } from '@/lib/helpers';
import { fetchArea } from './Suggestion.helpers';
import type { AreaFeature, SearchFeature } from '@/types/api.types';
import styles from './Suggestion.module.scss';

interface SuggestionProps {
    kommunenummer: string;
    onSelected: (feature: AreaFeature) => void;
}

export default function Suggestion({ kommunenummer, onSelected }: SuggestionProps) {
    const [suggestions, setSuggestions] = useState<SearchFeature[]>([]);
    const [selected, setSelected] = useState('');
    const suggestionInputRef = useRef<HTMLInputElement>(null);

    const handleSuggestionInput = debounce(async (event: FormEvent<HTMLInputElement>) => {
        const query = (event.target as HTMLInputElement).value.trim();

        if (query.length < 3) {
            return;
        }

        try {
            const response = await apiFetch(api.endpoints.search, { kommunenummer, query });
            setSuggestions(response.features);
        } catch (error) {
            console.log(error)
        }
    }, 500);

    async function handleSuggestionChange(item: SuggestionItem | null) {
        if (item === null) {
            return;
        }

        setSelected('');

        if (suggestionInputRef.current !== null) {
            suggestionInputRef.current.value = '';
        }

        const id = parseInt(item.value);
        const feature = suggestions.find(suggestion => suggestion.id === id);

        if (feature === undefined) {
            return;
        }

        setSuggestions([])

        try {
            const response = await fetchArea(kommunenummer, feature);

            if (response !== null) {
                onSelected(response);
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
                        <span className={styles.subTitle}>{props.data.matrikkelnummer}</span>
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
            <DsSuggestion.List className={styles.list}>
                <DsSuggestion.Empty>
                    Ingen treff
                </DsSuggestion.Empty>
                <div className={styles.innerList}>
                    {
                        suggestions.map(feature => (
                            <DsSuggestion.Option
                                key={feature.id}
                                value={feature.id}
                                label={feature.properties.value}
                            >
                                <div className={styles.label}>
                                    {renderLabel(feature)}
                                </div>
                            </DsSuggestion.Option>
                        ))
                    }
                </div>
            </DsSuggestion.List>
        </DsSuggestion>
    );
}