import { useMemo } from 'react';
import { useGetKommuneByPointQuery } from 'store/api';
import useGeolocation from './useGeolocation';

export default function useCurrentLocation() {
    const coordinates = useGeolocation();
    const { data: kommune } = useGetKommuneByPointQuery({ coordinates }, { skip: coordinates === undefined });

    const currentLocation = useMemo(
        () => {
            if (coordinates === undefined || kommune === undefined) {
                return null;
            }

            const kommunenummer = kommune !== null ? 
                kommune.properties.kommunenummer : 
                null;

            return {
                coordinates,
                kommunenummer
            };
        },
        [coordinates, kommune]
    );

    return currentLocation
}