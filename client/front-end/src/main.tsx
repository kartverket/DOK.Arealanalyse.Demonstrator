import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import store from '@/app/store';
import '@/config/chartjs.config';
import '@/config/projections.config';
import '@/config/extents.config';
import '@/styles/styles.scss';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
);
