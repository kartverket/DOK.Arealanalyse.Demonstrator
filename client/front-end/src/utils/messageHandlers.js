import store from 'store';
import { updateProgress } from 'store/slices/progressSlice';
import { setCorrelationId } from 'store/slices/appSlice';

const messageHandlers = new Map();

messageHandlers.set('client_connected', message => { 
    store.dispatch(setCorrelationId(message));
});

messageHandlers.set('state_updated', message => { 
    store.dispatch(updateProgress(message));
});

export default messageHandlers;