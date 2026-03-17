import store from 'store';
import { updateState } from 'store/slices/progressSlice';
import { setCorrelationId } from 'store/slices/appSlice';

const messageHandlers = new Map();

messageHandlers.set('client_connected', message => { 
    store.dispatch(setCorrelationId(message));
});

messageHandlers.set('state_updated', message => { 
    store.dispatch(updateState(message));
});

export default messageHandlers;