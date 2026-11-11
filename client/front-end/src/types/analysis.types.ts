import type {
    AnalysisResponse,
    AnalysisResult,
    ResultStatus,
} from './api.types';

export interface ResultItem {
    id: string;
    status: ResultStatus;
    themes: string[];
    title: string | null;
    datasetTitle: string | null;
    preTitle: string | null;

    distance: {
        value: number;
        formatted: string | null;
    };

    hitArea: {
        value: number | null;
        formatted: string | null;
    };

    data: AnalysisResult;
}

export type MappedAnalysisResponse = Omit<AnalysisResponse, 'resultList'> & {
    id: string;
    resultList: ResultItem[];
};

export type AnalysisData = Omit<MappedAnalysisResponse, 'resultList'>;
export type ResultGroupings = Partial<Record<ResultStatus, ResultItem[]>>;
