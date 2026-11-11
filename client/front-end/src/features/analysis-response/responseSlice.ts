import {
    createSelector,
    createSlice,
    type PayloadAction,
} from '@reduxjs/toolkit';
import { inPlaceSort } from 'fast-sort';
import groupBy from 'lodash.groupby';
import { ResultStatus } from './constants';

import type { RootState } from '@/app/store';
import type {
    AnalysisData,
    MappedAnalysisResponse,
    ResultGroupings,
    ResultItem,
} from '@/types/analysis.types';
import type { ResultStatus as ResultStatusValue } from '@/types/api.types';

interface ResponseState {
    data: AnalysisData | null;

    results: {
        byId: Record<string, ResultItem>;
        allIds: string[];
    };

    selectedResultId: string | null;
    filteredResultIds: string[];

    mapDialog: {
        open: boolean;
        resultId: string | null;
    };
}

const initialState: ResponseState = {
    data: null,
    results: {
        byId: {},
        allIds: [],
    },
    selectedResultId: null,
    filteredResultIds: [],
    mapDialog: {
        open: false,
        resultId: null,
    },
};

export const responseSlice = createSlice({
    name: 'response',
    initialState,
    reducers: {
        setResponse: (state, action: PayloadAction<MappedAnalysisResponse>) => {
            const { resultList, ...rest } = action.payload;
            const byId: Record<string, ResultItem> = {};
            const allIds: string[] = [];

            for (const result of resultList) {
                byId[result.id] = result;
                allIds.push(result.id);
            }

            return {
                ...state,
                data: {
                    ...rest,
                },
                results: {
                    byId,
                    allIds,
                },
            };
        },
        setSelectedResultId: (state, action: PayloadAction<string | null>) => {
            return {
                ...state,
                selectedResultId: action.payload,
            };
        },
        setFilteredResultIds: (state, action: PayloadAction<string[]>) => {
            return {
                ...state,
                filteredResultIds: action.payload,
            };
        },
        setMapDialogOpen: (state, action: PayloadAction<boolean>) => {
            return {
                ...state,
                mapDialog: {
                    ...state.mapDialog,
                    open: action.payload,
                },
            };
        },
        setMapDialogResultId: (state, action: PayloadAction<string | null>) => {
            return {
                ...state,
                mapDialog: {
                    ...state.mapDialog,
                    resultId: action.payload,
                },
            };
        },
        resetResponseState: () => initialState,
    },
});

export const selectResults = createSelector(
    (state: RootState) => state.response.results.byId,
    (byId): ResultGroupings => {
        const results = Object.values(byId);
        const groupings: ResultGroupings = groupBy(
            results,
            (result) => result.status,
        );

        sortResults(
            groupings,
            [ResultStatus.HIT_RED, ResultStatus.HIT_YELLOW],
            (results) => {
                inPlaceSort(results).desc([
                    (result) => result.hitArea.value || 0,
                    (result) => result.themes[0],
                ]);
            },
        );

        sortResults(
            groupings,
            [ResultStatus.NO_HIT_YELLOW, ResultStatus.NO_HIT_GREEN],
            (results) => {
                inPlaceSort(results).asc([
                    (result) => result.distance.value,
                    (result) => result.themes[0],
                ]);
            },
        );

        sortResults(
            groupings,
            [
                ResultStatus.NOT_RELEVANT,
                ResultStatus.NOT_IMPLEMENTED,
                ResultStatus.TIMEOUT,
                ResultStatus.ERROR,
            ],
            (results) => {
                inPlaceSort(results).asc([
                    (result) => result.themes[0],
                    (result) => result.data.description,
                ]);
            },
        );

        return groupings;
    },
);

function sortResults(
    groupings: ResultGroupings,
    statuses: ResultStatusValue[],
    sortFunc: (results: ResultItem[]) => void,
) {
    for (const status of statuses) {
        const results = groupings[status];
        if (Array.isArray(results)) {
            sortFunc(results);
        }
    }
}

export const {
    setResponse,
    setSelectedResultId,
    setFilteredResultIds,
    setMapDialogOpen,
    setMapDialogResultId,
    resetResponseState,
} = responseSlice.actions;

export default responseSlice.reducer;
