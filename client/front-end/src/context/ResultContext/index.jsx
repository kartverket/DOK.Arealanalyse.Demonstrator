import { createContext, useContext, useEffect, useState } from 'react';
import { useDebounce } from 'hooks';

export default function ResultProvider({ children }) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(
        () => {
            onSearchChange(debouncedSearchTerm);
        },
        [debouncedSearchTerm]
    );

    return (
        <ResultContext.Provider value={{ createMapImage, clearCache }}>
            {children}
        </ResultContext.Provider>
    );
}

export const ResultContext = createContext({});
export const useResult = () => useContext(ResultContext);