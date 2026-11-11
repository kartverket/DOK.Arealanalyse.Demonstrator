import { useEffect, useState } from 'react';

import type { LonLat } from '@/types/geo.types';

export default function useGeolocation() {
    const [coordinates, setCoordinates] = useState<LonLat | null>(null);
    const [loading, setLoading] = useState(() => 'geolocation' in navigator);

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates([
                    position.coords.longitude,
                    position.coords.latitude,
                ]);
                setLoading(false);
            },
            () => {
                setCoordinates(null);
                setLoading(false);
            },
        );
    }, []);

    return {
        coordinates,
        loading,
    };
}
