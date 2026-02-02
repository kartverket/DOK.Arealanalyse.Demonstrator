import useSWR from 'swr';
import fetcher from 'utils/fetcher';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function useDatafunnUrl() {
    const key = API_BASE_URL ? `${API_BASE_URL}/config/datafunn/url` : null;
    const { data, error, isLoading } = useSWR(key, fetcher);

    return {
        datafunnUrl: data,
        isLoading,
        isError: error
    };
}
