import { useEffect, useState } from 'react';
import { getCurrentLocation } from 'utils/map/helpers';

export default function useGeolocation() {
    const [coordinates, setCoordinates] = useState(null);
    const [resolved, setResolved] = useState(false);

    useEffect(
        () => {
            (async () => {
                setCoordinates(await getCurrentLocation());
                setResolved(true);
            })();
        },
        []
    );

    return {
        coordinates,
        loading: !resolved
    };
}
