import { useMemo, useRef, useState, type InputEvent } from 'react';
import { api } from '@/lib/api/api';
import { debounce } from '@/lib/helpers';
import { apiFetch } from '@/app/apiFetch';
import { setArea } from '@/app/appSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchArea, getAreaTitle } from './AreaSuggestion.helpers';
import {
    EXPERIMENTAL_Suggestion as DsSuggestion,
    type SuggestionItem,
} from 'dibk-designsystemet';
import styles from '@/styles/suggestion.module.scss';

import type { SearchFeature } from '@/types/api.types';

interface AreaSuggestionProps {
    kommunenummer: string;
}

export default function AreaSuggestion({ kommunenummer }: AreaSuggestionProps) {
    const selectedLabel = useAppSelector((state) => {
        const source = state.app.area?.source;
        return source?.type === 'search' ? source.label : null;
    });
    const [suggestions, setSuggestions] = useState<SearchFeature[]>([]);

    // Viser valget mens området hentes, før det ligger i storen
    const [pendingLabel, setPendingLabel] = useState<string | null>(null);
    const suggestionInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();

    // Lages kun på nytt når kommunen endres, ellers nullstilles ikke ventende søk ved rendring
    const handleSuggestionInput = useMemo(
        () =>
            debounce(async (event: InputEvent<HTMLInputElement>) => {
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
            }, 500),
        [kommunenummer],
    );

    function resetSuggestion() {
        setPendingLabel(null);
        setSuggestions([]);

        // Et område valgt fra eksempel eller fil fjernes ikke når søket tømmes
        if (selectedLabel !== null) {
            dispatch(setArea(null));
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

        setPendingLabel(item.label);

        try {
            const geometry = await fetchArea(kommunenummer, feature);
            if (geometry !== null) {
                dispatch(
                    setArea({
                        geometry,
                        title: getAreaTitle(feature),
                        source: { type: 'search', label: item.label },
                    }),
                );
            }
        } catch (error) {
            console.log(error);
        } finally {
            setPendingLabel(null);
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
            selected={pendingLabel ?? selectedLabel ?? ''}
            onSelectedChange={handleSuggestionChange}
            filter={() => true}
        >
            <DsSuggestion.Input
                ref={suggestionInputRef}
                onInput={handleSuggestionInput}
                disabled={kommunenummer === ''}
                spellCheck={false}
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
