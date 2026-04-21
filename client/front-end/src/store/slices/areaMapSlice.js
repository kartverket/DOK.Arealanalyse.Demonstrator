import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedGeometry: null,
    isValid: true,
    undoRedo: {
        hasUndo: false,
        hasRedo: false
    }
};

export const areaMapSlice = createSlice({
    name: 'areaMap',
    initialState,
    reducers: {
        setSelectedGeometry: (state, action) => {
            return {
                ...state,
                selectedGeometry: action.payload
            };
        },
        setValid: (state, action) => {
            return {
                ...state,
                isValid: action.payload
            };
        },
        setUndoRedo: (state, action) => {
            return {
                ...state,
                undoRedo: {
                    ...state.undoRedo,
                    ...action.payload
                }
            };
        }    
    }
});

export const { 
    setSelectedGeometry,
    setValid,
    setUndoRedo
} = areaMapSlice.actions;

export default areaMapSlice.reducer;