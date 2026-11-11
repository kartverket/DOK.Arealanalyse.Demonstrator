import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import { setToast } from './appSlice';

interface RejectedPayload {
    status: number | string;
    data?: {
        detail?: string;
    };
}

export const rtkQueryErrorCatcher: Middleware = (api) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        const payload = action.payload as RejectedPayload;
        const message = payload.data?.detail;

        if (message) {
            api.dispatch(setToast({ message }));
            throw `${payload.status}: ${message}`;
        }
    }

    return next(action);
};
