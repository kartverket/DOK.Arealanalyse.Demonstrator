import { isRejectedWithValue } from '@reduxjs/toolkit';
import { setToast } from './slices/appSlice';

export const rtkQueryErrorCatcher = (api) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        const message = action.payload.data?.detail;

        if (message) {
            api.dispatch(setToast({ message }));
            throw `${action.payload.status}: ${message}`;
        }
    }

    return next(action);
};
