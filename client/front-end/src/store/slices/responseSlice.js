import { createSelector, createSlice } from '@reduxjs/toolkit';
import { inPlaceSort } from 'fast-sort';
import groupBy from 'lodash.groupby';
import { ResultStatus } from 'utils/constants';

const initialState = {
    data: null,
    results: {
        byId: {},
        allIds: []
    },
    selectedResultId: null,
    filteredResultIds: [],
    mapDialog: {
        open: false,
        resultId: null
    }
};

export const responseSlice = createSlice({
    name: 'response',
    initialState,
    reducers: {
        setResponse: (state, action) => {
            const { resultList, ...rest } = action.payload;
            const byId = {};
            const allIds = [];

            for (const result of resultList) {
                byId[result.id] = result;
                allIds.push(result.id);
            }

            return {
                ...state,
                data: {
                    ...rest
                },
                results: {
                    byId,
                    allIds
                }
            };
        },
        setSelectedResultId: (state, action) => {
            return {
                ...state,
                selectedResultId: action.payload
            };
        },              
        setFilteredResultIds: (state, action) => {
            return {
                ...state,
                filteredResultIds: action.payload
            };
        },
        setMapDialogOpen: (state, action) => {
            return {
                ...state,
                mapDialog: {
                    ...state.mapDialog,
                    open: action.payload
                }
            };
        },
        setMapDialogResultId: (state, action) => {
            return {
                ...state,
                mapDialog: {
                    ...state.mapDialog,
                    resultId: action.payload
                }
            };
        },          
        resetState: () => initialState
    }
});

export const selectResults = createSelector(
    state => state.response.results.byId,
    byId => {
        const results = Object.values(byId);
        const groupings = groupBy(results, result => result.status);

        sortResults(groupings, [ResultStatus.HIT_RED, ResultStatus.HIT_YELLOW], results => {
            inPlaceSort(results).desc([
                result => result.hitArea.value || 0,
                result => result.themes[0]
            ]);
        });

        sortResults(groupings, [ResultStatus.NO_HIT_YELLOW, ResultStatus.NO_HIT_GREEN], results => {
            inPlaceSort(results).asc([
                result => result.distance.value,
                result => result.themes[0]
            ]);
        });

        sortResults(groupings, [ResultStatus.NOT_RELEVANT, ResultStatus.NOT_IMPLEMENTED, ResultStatus.TIMEOUT, ResultStatus.ERROR], results => {
            inPlaceSort(results).asc([
                result => result.themes[0],
                result => result.description
            ]);
        });

        return groupings;
    }
);

function sortResults(groupings, statuses, sortFunc) {
    for (const status in statuses) {
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
    resetState
} = responseSlice.actions;

export default responseSlice.reducer;