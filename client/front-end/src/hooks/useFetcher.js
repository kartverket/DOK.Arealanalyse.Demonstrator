import useSWR from 'swr';
import { fetcher } from 'utils/api';

export default function useFetcher(url) {
    return useSWR(url, fetcher, { revalidateOnFocus: false, refreshInterval: 0 });
}