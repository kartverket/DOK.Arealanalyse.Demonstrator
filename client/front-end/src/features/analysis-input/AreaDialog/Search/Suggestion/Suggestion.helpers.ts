import { api } from '@/lib/api/api';
import { apiFetch } from '@/app/apiFetch';

import type { AreaFeature, SearchFeature } from '@/types/api.types';

export async function fetchArea(
    kommunenummer: string,
    feature: SearchFeature,
): Promise<AreaFeature | null> {
    const props = feature.properties;
    switch (props.type) {
        case 'Eiendom':
        case 'Vegadresse':
            if (feature.geometry === null) {
                return null;
            }

            return await apiFetch(api.endpoints.getEiendom, {
                geometry: feature.geometry,
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
