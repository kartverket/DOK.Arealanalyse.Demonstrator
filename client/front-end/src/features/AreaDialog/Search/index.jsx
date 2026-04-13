import { useMemo, useState } from 'react';
import { EXPERIMENTAL_Suggestion as Suggestion, Field, Label, Select } from '@digdir/designsystemet-react';
import styles from './Search.module.scss';
import { api, apiFetch, useGetKommunerQuery } from 'store/api';
import { useDispatch } from 'react-redux';
import { debounce } from 'utils/helpers';

const _data = [
    {
        "value": "4020-51/291",
        "label": "4020-51/291",
        "label2": {
            "type": "div",
            "key": null,
            "props": {
                "children": [
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "4020-51/291"
                        },
                        "_owner": null,
                        "_store": {}
                    },
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "Eventyrskogen 1"
                        },
                        "_owner": null,
                        "_store": {}
                    }
                ]
            },
            "_owner": null,
            "_store": {}
        }
    },
    {
        "value": "4020-51/298",
        "label": "4020-51/298",
        "label2": {
            "type": "div",
            "key": null,
            "props": {
                "children": [
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "4020-51/298"
                        },
                        "_owner": null,
                        "_store": {}
                    },
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "Eventyrskogen 2"
                        },
                        "_owner": null,
                        "_store": {}
                    }
                ]
            },
            "_owner": null,
            "_store": {}
        }
    },
    {
        "value": "4020-51/300",
        "label": "4020-51/300",
        "label2": {
            "type": "div",
            "key": null,
            "props": {
                "children": [
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "4020-51/300"
                        },
                        "_owner": null,
                        "_store": {}
                    },
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "Eventyrskogen 11"
                        },
                        "_owner": null,
                        "_store": {}
                    }
                ]
            },
            "_owner": null,
            "_store": {}
        }
    },
    {
        "value": "4020-51/306",
        "label": "4020-51/306",
        "label2": {
            "type": "div",
            "key": null,
            "props": {
                "children": [
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "4020-51/306"
                        },
                        "_owner": null,
                        "_store": {}
                    },
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "Eventyrskogen 12"
                        },
                        "_owner": null,
                        "_store": {}
                    }
                ]
            },
            "_owner": null,
            "_store": {}
        }
    },
    {
        "value": "4020-51/302",
        "label": "4020-51/302",
        "label2": {
            "type": "div",
            "key": null,
            "props": {
                "children": [
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "4020-51/302"
                        },
                        "_owner": null,
                        "_store": {}
                    },
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "Eventyrskogen 13"
                        },
                        "_owner": null,
                        "_store": {}
                    }
                ]
            },
            "_owner": null,
            "_store": {}
        }
    },
    {
        "value": "4020-51/307",
        "label": "4020-51/307",
        "label2": {
            "type": "div",
            "key": null,
            "props": {
                "children": [
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "4020-51/307"
                        },
                        "_owner": null,
                        "_store": {}
                    },
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "Eventyrskogen 14"
                        },
                        "_owner": null,
                        "_store": {}
                    }
                ]
            },
            "_owner": null,
            "_store": {}
        }
    },
    {
        "value": "4020-51/303",
        "label": "4020-51/303",
        "label2": {
            "type": "div",
            "key": null,
            "props": {
                "children": [
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "4020-51/303"
                        },
                        "_owner": null,
                        "_store": {}
                    },
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "Eventyrskogen 15"
                        },
                        "_owner": null,
                        "_store": {}
                    }
                ]
            },
            "_owner": null,
            "_store": {}
        }
    },
    {
        "value": "4020-51/308",
        "label": "4020-51/308",
        "label2": {
            "type": "div",
            "key": null,
            "props": {
                "children": [
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "4020-51/308"
                        },
                        "_owner": null,
                        "_store": {}
                    },
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "Eventyrskogen 17"
                        },
                        "_owner": null,
                        "_store": {}
                    }
                ]
            },
            "_owner": null,
            "_store": {}
        }
    },
    {
        "value": "4020-51/309",
        "label": "4020-51/309",
        "label2": {
            "type": "div",
            "key": null,
            "props": {
                "children": [
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "4020-51/309"
                        },
                        "_owner": null,
                        "_store": {}
                    },
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "Eventyrskogen 19"
                        },
                        "_owner": null,
                        "_store": {}
                    }
                ]
            },
            "_owner": null,
            "_store": {}
        }
    },
    {
        "value": "4020-51/310",
        "label": "4020-51/310",
        "label2": {
            "type": "div",
            "key": null,
            "props": {
                "children": [
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "4020-51/310"
                        },
                        "_owner": null,
                        "_store": {}
                    },
                    {
                        "type": "span",
                        "key": null,
                        "props": {
                            "children": "Eventyrskogen 21"
                        },
                        "_owner": null,
                        "_store": {}
                    }
                ]
            },
            "_owner": null,
            "_store": {}
        }
    }
]

export default function Search() {
    const [selectedKommunenummer, setSelectedKommunenummer] = useState('');
    const { data = null } = useGetKommunerQuery();
    const [suggestions, setSuggestions] = useState(_data);
    const dispatch = useDispatch();

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

        setSelectedKommunenummer(kommunenummer);
        const res = await apiFetch(() => api.endpoints.getPlanIds.initiate({ kommunenummer }));

        console.log(res);
    }

    const handleSuggestionChange = debounce(async event => {
        const query = event.target.value.trim();

        if (query.length < 3) {
            return;
        }

        const response = await apiFetch(() => api.endpoints.search.initiate({ kommunenummer: selectedKommunenummer, query }));

        const suggestions = response.features
            .map(({ properties }) => ({
                value: properties.matrikkelnummer,
                label: properties.matrikkelnummer,
                label2: (
                    <div>
                        <span>{properties.matrikkelnummer}</span>
                        <span>{properties.adressetekst}</span>
                    </div>
                )
            }));

        console.log(suggestions)
        setSuggestions(suggestions)
    }, 500);


    return (
        <div className={styles.search}>
            <Field>
                <Label>Kommune</Label>
                <Select
                    value={selectedKommunenummer}
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
                <Label>Plan-ID, matrikkelnummer eller vegadresse</Label>

                <Suggestion>
                    <Suggestion.Input onInput={handleSuggestionChange} />
                    <Suggestion.Clear />
                    <Suggestion.List>
                        <Suggestion.Empty>
                            Ingen treff
                        </Suggestion.Empty>
                        {
                            suggestions.map(suggestion => (
                                <Suggestion.Option 
                                    key={suggestion.value}
                                    value={suggestion.value}
                                    label={suggestion.label}
                                >
                                    {suggestion.label}
                                </Suggestion.Option>
                            ))
                        }
                    </Suggestion.List>
                </Suggestion>
            </Field>
        </div>
    )
}