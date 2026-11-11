import store from '@/app/store';
import { updateProgress } from './progressSlice';
import { setCorrelationId } from '@/app/appSlice';

const messageHandlers = new Map();

messageHandlers.set('client_connected', message => { 
    store.dispatch(setCorrelationId(message));
});

messageHandlers.set('state_updated', message => { 
    store.dispatch(updateProgress(message));
});

export default messageHandlers;