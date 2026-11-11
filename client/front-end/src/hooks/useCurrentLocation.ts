import { skipToken } from '@reduxjs/toolkit/query';
import { useGetKommuneByPointQuery } from '@/lib/api/api';
import useGeolocation from './useGeolocation';

export default function useCurrentLocation() {
    const { coordinates, loading: geoLoading } = useGeolocation();
    const queryArg = coordinates ? { coordinates } : skipToken;
    const {
        data,
        error,
        isLoading: apiLoading,
    } = useGetKommuneByPointQuery(queryArg);
    return {
        coordinates,
        kommunenummer: data?.properties.kommunenummer ?? null,
        loading: geoLoading || apiLoading,
        error: error ?? null,
    };
}
