import { createContext, useContext, useRef, useState } from 'react';

export default function ResponseProvider({ children }) {
    const [response, setResponse] = useState(null);
    const [busy, setBusy] = useState(false);
    const mapCacheRef = useRef(new Map());

    return (
        <ResponseContext.Provider value={{ response, setResponse, busy, setBusy, mapCacheRef }}>
            {children}
        </ResponseContext.Provider>
    );
}

export const ResponseContext = createContext({});
export const useResponse = () => useContext(ResponseContext);
