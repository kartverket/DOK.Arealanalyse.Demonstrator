import { isRejectedWithValue, type Middleware } from '@reduxjs/toolkit';
import { setToast } from './appSlice';

interface RejectedPayload {
    status: number | string;

    data?: {
        detail?: string;
    };
}

// Feil ved henting av jobber vises av pollJob og av sidene for resultater
const SILENT_ENDPOINTS = new Set(['getJob', 'getJobs']);

export const rtkQueryErrorCatcher: Middleware = (api) => (next) => (action) => {
    if (isRejectedWithValue(action) && !isSilent(action.meta)) {
        const payload = action.payload as RejectedPayload;
        const message = payload.data?.detail;
        if (message) {
            api.dispatch(setToast({ message }));
            throw `${payload.status}: ${message}`;
        }
    }

    return next(action);
};

function isSilent(meta: unknown): boolean {
    const endpointName = (meta as { arg?: { endpointName?: string } }).arg
        ?.endpointName;
    return endpointName !== undefined && SILENT_ENDPOINTS.has(endpointName);
}
