import { api } from 'store/api';

export function getApiParams(kommunenummer, feature) {
    const props = feature.properties;
    const type = props.type;

    switch (type) {
        case 'Eiendom':
        case 'Vegadresse':
            return [
                api.endpoints.getEiendom,
                { geometry: feature.geometry }
            ];
        case 'Reguleringsplan':
            return [
                api.endpoints.getReguleringsplan,
                { kommunenummer, planId: props.data.planId }
            ];
        case 'Reguleringsplanforslag':
            return [
                api.endpoints.getReguleringsplanforslag,
                { kommunenummer, planId: props.data.planId }
            ];
        default:
            return [];
    }
}