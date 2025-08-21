import store from 'store';
import { addStep, setStatus, setTotalSteps } from 'store/slices/datasetSlice';

const messageHandlers = new Map();

messageHandlers.set('datasets_counted', message => {
    const count = parseInt(message);

    store.dispatch(setTotalSteps(count))
    store.dispatch(setStatus('Analyserer...'));
});

messageHandlers.set('dataset_analyzed', _ => {
    store.dispatch(addStep());
});

messageHandlers.set('create_fact_sheet', _ => {
    store.dispatch(addStep());
    store.dispatch(setStatus('Lager faktainformasjon...'));
});

messageHandlers.set('create_map_images', _ => {
    store.dispatch(addStep());
    store.dispatch(setStatus('Lager kartbilder...'));
});

messageHandlers.set('create_report', _ => {
    store.dispatch(addStep());
    store.dispatch(setStatus('Lager rapport...'));
});

export default messageHandlers;