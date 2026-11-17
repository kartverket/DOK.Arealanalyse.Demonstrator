import { useMemo, useRef, useState, type InputEvent } from 'react';
import { api } from '@/lib/api/api';
import { debounce } from '@/lib/helpers';
import { apiFetch } from '@/app/apiFetch';
import {
    EXPERIMENTAL_Suggestion as DsSuggestion,
    type SuggestionItem,
} from 'dibk-designsystemet';
import styles from './AddressSearch.module.scss';
import suggestionStyles from '@/styles/suggestion.module.scss';

import type {
    AdresseSearchFeature,
    EiendomSearchData,
} from '@/types/api.types';
import type { LonLat } from '@/types/geo.types';

interface AddressSearchProps {
    // null når søket tømmes
    onSelect: (coordinates: LonLat | null) => void;
}

export default function AddressSearch({ onSelect }: AddressSearchProps) {
    const [suggestions, setSuggestions] = useState<AdresseSearchFeature[]>([]);
    const [selectedLabel, setSelectedLabel] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Lages én gang, ellers nullstilles ikke ventende søk ved rendring
    const handleInput = useMemo(
        () =>
            debounce(async (event: InputEvent<HTMLInputElement>) => {
                const query = (event.target as HTMLInputElement).value.trim();
                if (query.length < 3) {
                    return;
                }

                try {
                    const response = await apiFetch(
                        api.endpoints.searchAdresse,
                        { query },
                    );
                    setSuggestions(response.features);
                } catch (error) {
                    console.log(error);
                }
            }, 500),
        [],
    );

    function handleSelectedChange(item: SuggestionItem | null) {
        if (item === null) {
            setSelectedLabel('');
            setSuggestions([]);
            onSelect(null);
            return;
        }

        if (inputRef.current !== null) {
            inputRef.current.value = '';
        }

        const id = parseInt(item.value);
        const feature = suggestions.find((suggestion) => suggestion.id === id);
        if (feature === undefined) {
            return;
        }

        setSelectedLabel(item.label);
        onSelect(feature.geometry.coordinates as LonLat);
    }

    return (
        <DsSuggestion
            selected={selectedLabel}
            onSelectedChange={handleSelectedChange}
            filter={() => true}
            className={styles.addressSearch}
        >
            <DsSuggestion.Input
                ref={inputRef}
                onInput={handleInput}
                placeholder="Søk etter vegadresse"
                aria-label="Søk etter vegadresse"
                spellCheck={false}
            />

            <DsSuggestion.Clear />

            <DsSuggestion.List className={suggestionStyles.list}>
                <DsSuggestion.Empty>Ingen treff</DsSuggestion.Empty>

                <div className={suggestionStyles.innerList}>
                    {suggestions.map((feature) => (
                        <DsSuggestion.Option
                            key={feature.id}
                            value={feature.id}
                            label={feature.properties.value}
                        >
                            <div className={suggestionStyles.label}>
                                <span>
                                    {feature.properties.data.adressetekst}
                                </span>
                                <span className={suggestionStyles.subTitle}>
                                    {getPlace(feature.properties.data)}
                                </span>
                            </div>
                        </DsSuggestion.Option>
                    ))}
                </div>
            </DsSuggestion.List>
        </DsSuggestion>
    );
}

// Uten kommunefilter finnes samme adresse i mange kommuner, så poststed og kommune skiller treffene
function getPlace(data: EiendomSearchData): string {
    const { postnummer, poststed, kommunenavn } = data;
    const place = `${postnummer} ${poststed}`;
    return poststed !== kommunenavn ? `${place}, ${kommunenavn}` : place;
}
