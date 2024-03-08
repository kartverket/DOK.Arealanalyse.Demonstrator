import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material';
import MapProvider from 'context/MapContext';
import App from './App.jsx';
import theme from 'config/theme.config.js';
import 'config/projections.config';
import 'config/extents.config';
import 'styles/styles.scss';

const root = document.getElementById('root');

ReactDOM.createRoot(root).render(
   <React.StrictMode>
      <ThemeProvider theme={theme}>
         <MapProvider>
            <App />
         </MapProvider>
      </ThemeProvider>
   </React.StrictMode>
);

