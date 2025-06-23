import store from 'store';
import { addAnalyzed, setCount, setStatus } from 'store/slices/datasetSlice';

const messageHandlers = new Map();

messageHandlers.set('datasets_counted', message => {
    store.dispatch(setCount(parseInt(message)));
    store.dispatch(setStatus('Analyserer...'));
});

messageHandlers.set('dataset_analyzed', message => {
    store.dispatch(addAnalyzed(message));
});

messageHandlers.set('create_fact_sheet', _ => {
    store.dispatch(setStatus('Lager faktainformasjon...'));
});

messageHandlers.set('create_map_images', _ => {
    store.dispatch(setStatus('Lager kartbilder...'));
});

messageHandlers.set('create_report', _ => {
    store.dispatch(setStatus('Lager rapport...'));
});

export default messageHandlers;