import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import appReducer from './slices/appSlice';
import progressReducer from './slices/progressSlice';
import responseReducer from './slices/responseSlice';

export default configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        app: appReducer,
        progress: progressReducer,
        response: responseReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
});
