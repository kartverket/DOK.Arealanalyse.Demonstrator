import { Button, EXPERIMENTAL_Suggestion as DsSuggestion } from '@digdir/designsystemet-react';
import { useRef, useState } from 'react';
import { api, apiFetch } from 'store/api';
import { debounce } from 'utils/helpers';
import { getApiParams } from './helpers';
import styles from './Suggestion.module.scss';
import { ZoomPlusIcon } from '@navikt/aksel-icons';

export default function Suggestion({ kommunenummer, onSelected }) {
    const [suggestions, setSuggestions] = useState([]);
    const [selected, setSelected] = useState('');
    const suggestionInputRef = useRef(null);

    const handleSuggestionInput = debounce(async event => {
        const query = event.target.value.trim();

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

    async function handleSuggestionChange({ value }) {
        setSelected('');
        suggestionInputRef.current.value = '';

        const id = parseInt(value);
        const feature = suggestions.find(suggestion => suggestion.id === id);
        const [endpoint, params] = getApiParams(kommunenummer, feature);
        setSuggestions([])

        try {
            const response = await apiFetch(endpoint, params);
            onSelected(response);
        } catch (error) {
            console.log(error);
        }
    }

    function renderLabel(feature) {
        const props = feature.properties;
        const type = props.type;

        switch (type) {
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
                        <div>
                            <span>{props.data.adressetekst}</span>
                            <span className={styles.subTitle}>{props.data.matrikkelnummer}</span>
                            <span className={styles.type}>{type}</span>
                        </div>
                        <Button variant="tertiary" icon>
                            <ZoomPlusIcon />
                        </Button>
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