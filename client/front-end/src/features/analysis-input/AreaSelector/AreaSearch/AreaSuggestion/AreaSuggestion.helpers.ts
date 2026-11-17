import { api } from '@/lib/api/api';
import { apiFetch } from '@/app/apiFetch';
import { describeArea, type AreaDescription } from '../../AreaSelector.helpers';

import type { AnalysisAreaType, SearchFeature } from '@/types/api.types';
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

const SEARCH_AREA_TYPES = {
    Eiendom: 'eiendom',
    Vegadresse: 'vegadresse',
    Reguleringsplan: 'reguleringsplan',
    Reguleringsplanforslag: 'reguleringsplanforslag',
} as const satisfies Record<
    SearchFeature['properties']['type'],
    AnalysisAreaType
>;

export function describeSearchArea(feature: SearchFeature): AreaDescription {
    const props = feature.properties;
    const { kommunenummer, kommunenavn } = props.data;
    const type = SEARCH_AREA_TYPES[props.type];

    switch (props.type) {
        case 'Eiendom':
        case 'Vegadresse': {
            const { matrikkelnummer, adressetekst, postnummer, poststed } =
                props.data;
            const adresse = `${adressetekst}, ${postnummer} ${poststed}`;

            return props.type === 'Eiendom'
                ? describeArea({
                      type,
                      label: props.type,
                      name: matrikkelnummer,
                      detail: adresse,
                      kommunenummer,
                      kommunenavn,
                  })
                : describeArea({
                      type,
                      label: props.type,
                      name: adresse,
                      detail: matrikkelnummer,
                      kommunenummer,
                      kommunenavn,
                  });
        }
        case 'Reguleringsplan':
        case 'Reguleringsplanforslag': {
            const { planId, plannavn } = props.data;

            return describeArea({
                type,
                label: props.type,
                name: plannavn !== null ? `${planId}: ${plannavn}` : planId,
                kommunenummer,
                kommunenavn,
            });
        }
    }
}
