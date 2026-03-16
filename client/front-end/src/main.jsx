import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import MapProvider from 'context/MapContext';
import App from './App.jsx';
import store from 'store';
import theme from 'config/theme.config.js';
import 'config/projections.config';
import 'config/extents.config';
import 'config/chartjs.config';
import 'styles/styles.scss';
import AnalysesProvider from 'context/AnalysesContext/index.jsx';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <MapProvider>
                    <AnalysesProvider>
                        <App />
                    </AnalysesProvider>
                </MapProvider>
            </ThemeProvider>
        </Provider>
    </React.StrictMode>
);

