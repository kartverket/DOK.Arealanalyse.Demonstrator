import { RESULT_STATUS } from 'utils/constants';

export function getTabVisibility(result) {
    const showMap = [RESULT_STATUS.HIT_RED, RESULT_STATUS.HIT_YELLOW].includes(result.status);
    const showActions = result.data.possibleActions.length > 0 || result.data.guidanceUri.length > 0;
    const showQuality = result.data.qualityMeasurement.length > 0;

    return {
        map: showMap,
        actions: showActions,
        quality: showQuality
    };
}