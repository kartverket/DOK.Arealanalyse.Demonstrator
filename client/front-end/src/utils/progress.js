export const STATUS = {
    STARTING_UP: 'STARTING_UP',
    ANALYZING_DATASETS: 'ANALYZING_DATASETS',
    DATASET_ANALYZED: 'DATASET_ANALYZED',
    CREATING_FACT_SHEET: 'CREATING_FACT_SHEET',
    CREATING_MAP_IMAGES: 'CREATING_MAP_IMAGES',
    MAP_IMAGE_CREATED: 'MAP_IMAGE_CREATED',
    CREATING_REPORT: 'CREATING_REPORT'
};

export const STATUS_TEXT = {
    [STATUS.STARTING_UP]: 'Starter opp...',
    [STATUS.ANALYZING_DATASETS]: 'Analyserer datasett 1 av {0}...',
    [STATUS.DATASET_ANALYZED]: 'Analyserer datasett {0} av {1}...',
    [STATUS.CREATING_FACT_SHEET]: 'Lager rapport...',
    [STATUS.CREATING_MAP_IMAGES]: 'Lager kartbilde 1 av {0}...',
    [STATUS.MAP_IMAGE_CREATED]: 'Lager kartbilde {0} av {1}...',
    [STATUS.CREATING_REPORT]: 'Lager rapport...'
};

export function getStatusText(state) {
    switch (state.status) {
        case STATUS.ANALYZING_DATASETS:
            return formatString(STATUS_TEXT.ANALYZING_DATASETS, state.analysesTotal)
        case STATUS.DATASET_ANALYZED:
            return formatString(STATUS_TEXT.DATASET_ANALYZED, state.analysisCount, state.analysesTotal);
        case STATUS.CREATING_MAP_IMAGES:
            return formatString(STATUS_TEXT.CREATING_MAP_IMAGES, state.mapImagesTotal);
        case STATUS.MAP_IMAGE_CREATED:
            return formatString(STATUS_TEXT.MAP_IMAGE_CREATED, state.mapImageCount, state.mapImagesTotal);
        default:
            return STATUS_TEXT[state.status];
    }
}

function formatString(str, ...values) {
    return str.replace(/{(\d+)}/g, (match, index) => {
        return typeof values[index] !== 'undefined' ? values[index] : match;
    });
}