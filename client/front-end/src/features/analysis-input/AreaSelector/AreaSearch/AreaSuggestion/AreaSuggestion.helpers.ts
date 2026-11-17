import { api } from '@/lib/api/api';
import { apiFetch } from '@/app/apiFetch';
import { getKommuneTitle } from '../../AreaSelector.helpers';

import type { SearchFeature } from '@/types/api.types';
import type { CrsGeometry } from '@/types/geo.types';

export async function fetchArea(
    kommunenummer: string,
    feature: SearchFeature,
): Promise<CrsGeometry | null> {
    const props = feature.properties;

    switch (props.type) {
        case 'Eiendom':
        case 'Vegadresse':
            return await apiFetch(api.endpoints.getEiendom, {
                kommunenummer,
                gardsnummer: props.data.gardsnummer,
                bruksnummer: props.data.bruksnummer,
                festenummer: props.data.festenummer,
            });
        case 'Reguleringsplan':
            return await apiFetch(api.endpoints.getReguleringsplan, {
                kommunenummer,
                planId: props.data.planId,
            });
        case 'Reguleringsplanforslag':
            return await apiFetch(api.endpoints.getReguleringsplanforslag, {
                kommunenummer,
                planId: props.data.planId,
            });
        default:
            return null;
    }
}

export function getAreaTitle(feature: SearchFeature): string[] {
    const props = feature.properties;
    const kommune = getKommuneTitle(
        props.data.kommunenavn,
        props.data.kommunenummer,
    );

    switch (props.type) {
        case 'Eiendom':
        case 'Vegadresse': {
            const { matrikkelnummer, adressetekst, postnummer, poststed } =
                props.data;
            const adresse = `${adressetekst}, ${postnummer} ${poststed}`;
            return props.type === 'Eiendom'
                ? [props.type, matrikkelnummer, adresse, ...kommune]
                : [props.type, adresse, matrikkelnummer, ...kommune];
        }
        case 'Reguleringsplan':
        case 'Reguleringsplanforslag': {
            const { planId, plannavn } = props.data;
            return [
                props.type,
                plannavn !== null ? `${planId}: ${plannavn}` : planId,
                ...kommune,
            ];
        }
    }
}
