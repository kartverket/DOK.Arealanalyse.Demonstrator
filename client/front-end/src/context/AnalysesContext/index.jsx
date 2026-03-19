import { createContext, useContext, useState } from 'react';

export default function AnalysesProvider({ children }) {
    const [response, setResponse] = useState(null);
    const [mapImages, setMapImages] = useState({});
    const [busy, setBusy] = useState(false);

    return (
        <AnalysesContext.Provider value={{ response, setResponse, busy, setBusy, mapImages, setMapImages }}>
            {children}
        </AnalysesContext.Provider>
    );
}

export const AnalysesContext = createContext({});
export const useAnalyses = () => useContext(AnalysesContext);
