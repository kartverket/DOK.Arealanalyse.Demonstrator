import useSWR from 'swr';
import fetcher from 'utils/fetcher';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function useSamples() {
    const { data, error, isLoading } = useSWR(`${API_BASE_URL}/sample`, fetcher);

    return {
        samples: data,
        isLoading,
        isError: error
    };
}