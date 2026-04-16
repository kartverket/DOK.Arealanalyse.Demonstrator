import { useEffect, useState } from 'react';

export default function useGeolocation() {
    const [coordinates, setCoordinates] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(
        () => {
            if (!('geolocation' in navigator)) {
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    setCoordinates([position.coords.longitude, position.coords.latitude]);
                    setLoading(false);
                },
                () => {
                    setCoordinates(null);
                    setLoading(false);
                }
            );
        },
        []
    );

    return { 
        coordinates, 
        loading 
    };
}