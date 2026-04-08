import { createSlice } from '@reduxjs/toolkit';

const _formData = {
    "inputGeometry": {
        "type": "MultiPolygon",
        "coordinates": [
            [
                [
                    [
                        196245.008,
                        6562107.572
                    ],
                    [
                        196229.591,
                        6562103.926
                    ],
                    [
                        196222.105,
                        6562110.753
                    ],
                    [
                        196199.112,
                        6562159.204
                    ],
                    [
                        196268.705,
                        6562181.558
                    ],
                    [
                        196265.603,
                        6562198.885
                    ],
                    [
                        196264.261,
                        6562206.183
                    ],
                    [
                        196273.401,
                        6562215.36
                    ],
                    [
                        196281.051,
                        6562202.106
                    ],
                    [
                        196285.908,
                        6562182.168
                    ],
                    [
                        196297.046,
                        6562141.811
                    ],
                    [
                        196276.525,
                        6562135.399
                    ],
                    [
                        196253.464,
                        6562118.641
                    ],
                    [
                        196245.008,
                        6562107.572
                    ]
                ]
            ],
            [
                [
                    [
                        196343.502,
                        6562224.953
                    ],
                    [
                        196344.651,
                        6562222.869
                    ],
                    [
                        196344.928,
                        6562221.929
                    ],
                    [
                        196345.622,
                        6562219.926
                    ],
                    [
                        196346.472,
                        6562216.975
                    ],
                    [
                        196347.067,
                        6562215.554
                    ],
                    [
                        196347.084,
                        6562215.513
                    ],
                    [
                        196345.606,
                        6562214.842
                    ],
                    [
                        196338.31,
                        6562211.63
                    ],
                    [
                        196334.274,
                        6562220.829
                    ],
                    [
                        196341.57,
                        6562224.041
                    ],
                    [
                        196343.502,
                        6562224.953
                    ]
                ]
            ]
        ],
        "crs": {
            "type": "name",
            "properties": {
                "name": "urn:ogc:def:crs:EPSG::25833"
            }
        }
    },
    "requestedBuffer": '50',
    "context": '',
    "theme": '',
    "includeGuidance": true,
    "includeQualityMeasurement": true,
    "includeFilterChosenDOK": true,
    "includeFacts": true,
    "createBinaries": false
}

const initialState = {
    correlationId: null,

    formData: _formData,
    factInfoOpen: false,

    filteredResultIds: [],
    selectedResultId: 0,

    selectedResult: null,

    toast: null,
    errorMessage: null,
    busy: false
    // mapImages: {}
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setCorrelationId: (state, action) => {
            return {
                ...state,
                correlationId: action.payload
            };
        },
        setFormData: (state, action) => {
            return {
                ...state,
                formData: {
                    ...state.formData,
                    [action.payload.name]: action.payload.value
                }
            };
        },
        resetFormData: (state, action) => {
            return {
                ...state,
                formData: {
                    ...initialState.formData
                }
            };
        },
        toggleFactInfo: (state, action) => {
            return {
                ...state,
                factInfoOpen: action.payload
            };
        },
        setResponse: (state, action) => {
            return {
                ...state,
                response: action.payload
            };
        },
        setFilteredResultIds: (state, action) => {
            return {
                ...state,
                filteredResultIds: action.payload
            };
        },
        setSelectedResultId: (state, action) => {
            return {
                ...state,
                selectedResultId: action.payload
            };
        },
        setToast: (state, action) => {
            let toast = null;

            if (action.payload !== null) {
                toast = { ...action.payload };
                toast.type = toast.type || 'danger';
            }

            return {
                ...state,
                toast
            };
        },
        setSelectedResult: (state, action) => {
            return {
                ...state,
                selectedResult: action.payload
            };
        },
        setBusy: (state, action) => {
            return {
                ...state,
                busy: action.payload
            };
        }
    }
});

export const {
    setCorrelationId,
    setFormData,
    resetFormData,
    toggleFactInfo,
    setSelectedResult,
    setFilteredResultIds,
    setSelectedResultId,
    setErrorMessage,
    setToast,
    setBusy
} = appSlice.actions;

export default appSlice.reducer;

