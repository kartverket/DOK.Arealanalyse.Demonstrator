import { RESULT_STATUS } from 'utils/constants';

export function getSectionOptions(result) {
    const showMap = [RESULT_STATUS.HIT_RED, RESULT_STATUS.HIT_YELLOW].includes(result.status);
    const showActions = result.data.guidanceText !== null ||
        result.data.possibleActions.length > 0 ||
        result.data.guidanceUri.length > 0;
    const showData = result.data.data.length > 0;
    const showDataset = result.data.runOnDataset !== null;
    const showQuality = result.data.qualityMeasurement.length > 0;
    const showAnalyzis = result.data.runAlgorithm.length > 0;
    const internalLinks = [];

    if (showMap) {
        internalLinks.push({
            title: 'Kart',
            id: 'section-map'
        });
    }

    if (showActions) {
        internalLinks.push({
            title: 'Tiltak',
            id: 'section-actions'
        });
    }

    if (showData) {
        internalLinks.push({
            title: 'Data',
            id: 'section-data'
        });
    }

    if (showDataset) {
        internalLinks.push({
            title: 'Datasett',
            id: 'section-dataset'
        });
    }

    if (showQuality) {
        internalLinks.push({
            title: 'Kvalitet',
            id: 'section-quality'
        });
    }

    if (showAnalyzis) {
        internalLinks.push({
            title: 'Analyse',
            id: 'section-analyzis'
        });
    }

    return {
        show: {
            map: showMap,
            actions: showActions,
            data: showData,
            dataset: showDataset,
            quality: showQuality,
            analyzis: showAnalyzis
        },
        internalLinks
    };
}