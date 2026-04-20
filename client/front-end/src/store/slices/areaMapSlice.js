import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedGeometry: null,
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
    setUndoRedo
} = areaMapSlice.actions;

export default areaMapSlice.reducer;