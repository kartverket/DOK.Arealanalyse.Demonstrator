import store from '@/app/store';
import { updateProgress } from './progressSlice';
import { setCorrelationId } from '@/app/appSlice';
import type { ServerToClientEvents } from '@/types/socket.types';

const messageHandlers: ServerToClientEvents = {
    client_connected: message => {
        store.dispatch(setCorrelationId(message));
    },
    state_updated: message => {
        store.dispatch(updateProgress(message));
    }
};

export function handleDisconnect(): void {
    store.dispatch(setCorrelationId(null));
}

export default messageHandlers;
