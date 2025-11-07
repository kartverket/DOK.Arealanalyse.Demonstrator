import bbox from '@turf/bbox';
import { getCrsName, getEpsgCode } from 'utils/helpers';

export function buildQueryString(inputGeometry) {
    if (!inputGeometry) {
        return null;
    }

    const crsName = getCrsName(inputGeometry);
    const epsgCode = getEpsgCode(crsName);
    const extent = bbox(inputGeometry);

    return `?extent=${extent.join(',')}&epsg=${epsgCode}`;
}
