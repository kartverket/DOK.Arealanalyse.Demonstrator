import { EXPERIMENTAL_Suggestion as DsSuggestion } from '@digdir/designsystemet-react';
import { useRef, useState } from 'react';
import { api, apiFetch } from 'store/api';
import { debounce } from 'utils/helpers';
import styles from './Suggestion.module.scss';
import { getApiParams } from './helpers';
import { HouseIcon } from '@navikt/aksel-icons';
import AddressIcon from 'assets/gfx/icon-address.svg?react'
import ZoneIcon from 'assets/gfx/icon-zone.svg?react'

export default function Suggestion({ kommunenummer, onSelected }) {
    const [suggestions, setSuggestions] = useState([]);
    const [selected, setSelected] = useState('');
    const suggestionRef = useRef(null);

    const handleSuggestionInput = debounce(async event => {
        const query = event.target.value.trim();

        if (query.length < 3) {
            return;
        }

        const response = await apiFetch(api.endpoints.search, { kommunenummer, query });
        setSuggestions(response.features);
    }, 500);

    async function handleSuggestionChange({ value }) {
        setSelected('');
        suggestionRef.current.clear.click();

        const id = parseInt(value);
        const feature = suggestions.find(suggestion => suggestion.id === id);
        setSuggestions([])

        const [endpoint, params] = getApiParams(kommunenummer, feature);
        const response = await apiFetch(endpoint, params);

        onSelected(response);
    }

    function renderLabel(feature) {
        const props = feature.properties;
        const type = props.type;

        switch (type) {
            case 'Eiendom':
                return (
                    <>
                        <HouseIcon width="21" height="21" />
                        <div>
                            <span>{props.data.matrikkelnummer}</span>
                            <span className={styles.type}>{type}</span>
                        </div>
                    </>
                );
            case 'Vegadresse':
                return (
                    <>
                        <AddressIcon height="26" />
                        <div>
                            <span>{props.data.adressetekst}</span>
                            <span className={styles.subTitle}>{props.data.matrikkelnummer}</span>
                            <span className={styles.type}>{type}</span>
                        </div>
                    </>
                );
            case 'Reguleringsplan':
            case 'Reguleringsplanforslag':
                return (
                    <>
                        <ZoneIcon height="26" />
                        <div>
                            <span>{props.data.planId}</span>
                            <span className={styles.type}>{type}</span>
                        </div>
                    </>
                );
            default:
                return null;
        }
    }

    return (
        <DsSuggestion
            ref={suggestionRef}
            selected={selected}
            onSelectedChange={handleSuggestionChange}
            filter={() => true}
        >
            <DsSuggestion.Input
                onInput={handleSuggestionInput}
            />
            <DsSuggestion.Clear />
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