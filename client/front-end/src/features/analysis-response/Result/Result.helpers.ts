import { ResultStatus } from '../constants';
import type { InternalLink } from '@/components/InternalLinks/InternalLinks.types';
import type { ResultItem } from '@/types/analysis.types';

export function getSectionOptions(result: ResultItem) {
    const showMap = result.status === ResultStatus.HIT_RED || result.status === ResultStatus.HIT_YELLOW;
    const showActions = result.data.guidanceText !== null ||
        result.data.possibleActions.length > 0 ||
        result.data.guidanceUri.length > 0;
    const showData = result.data.data.length > 0;
    const showDataset = result.data.runOnDataset !== null;
    const showQuality = result.data.qualityMeasurement.length > 0;
    const showAnalysis = result.data.runAlgorithm.length > 0;
    const internalLinks: InternalLink[] = [];

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

    if (showAnalysis) {
        internalLinks.push({
            title: 'Analyse',
            id: 'section-analysis'
        });
    }

    return {
        show: {
            map: showMap,
            actions: showActions,
            data: showData,
            dataset: showDataset,
            quality: showQuality,
            analysis: showAnalysis
        },
        internalLinks
    };
}