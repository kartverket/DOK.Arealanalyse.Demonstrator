import React from 'react';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import router from '@/app/router';
import store from '@/app/store';
import '@/config/chartjs.config';
import '@/config/projections.config';
import '@/config/extents.config';
import 'dibk-designsystemet/fonts.css';
import 'dibk-designsystemet/styles.css';
import '@/styles/styles.scss';

const root = document.getElementById('root')!;

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>,
);
