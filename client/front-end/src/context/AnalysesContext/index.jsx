import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function AnalysesProvider({ children }) {
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);

    return (
        <AnalysesContext.Provider value={{ result, setResult, busy, setBusy }}>
            {children}
        </AnalysesContext.Provider>
    );
}

export const AnalysesContext = createContext({});
export const useAnalyses = () => useContext(AnalysesContext);
