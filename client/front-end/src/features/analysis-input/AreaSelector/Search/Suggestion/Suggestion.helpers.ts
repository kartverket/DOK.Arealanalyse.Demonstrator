import { api } from '@/lib/api/api';
import { apiFetch } from '@/app/apiFetch';

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
