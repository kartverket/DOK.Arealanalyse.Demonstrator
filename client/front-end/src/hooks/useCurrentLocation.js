
import useGeolocation from './useGeolocation';
import { useGetKommuneByPointQuery } from 'store/api';
import { skipToken } from '@reduxjs/toolkit/query';

export default function useCurrentLocation() {
    const { coordinates, loading: geoLoading } = useGeolocation();
    const queryArg = coordinates ? { coordinates } : skipToken;
    const { data, error, isLoading: apiLoading } = useGetKommuneByPointQuery(queryArg);
    
    return {
        coordinates,
        kommunenummer: data?.properties.kommunenummer ?? null,
        loading: geoLoading || apiLoading,
        error: error ?? null
    };
}