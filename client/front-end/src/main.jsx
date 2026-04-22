import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from 'store';
import App from './App.jsx';
import 'config/projections.config';
import 'config/extents.config';
import 'config/chartjs.config';
import 'styles/styles.scss';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);

