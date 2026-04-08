import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import progressReducer from './slices/progressSlice';
import responseReducer from './slices/responseSlice';

export default configureStore({
    reducer: {
        app: appReducer,
        progress: progressReducer,
        response: responseReducer
    }
});
