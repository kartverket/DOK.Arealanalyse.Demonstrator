import { useEffect, useState } from 'react';

export default function useGeolocation() {
    const [coordinates, setCoordinates] = useState(null);
    const [resolved, setResolved] = useState(false);

    useEffect(
        () => {
            const resolve = () => setResolved(true);

            if (!('geolocation' in navigator)) {
                queueMicrotask(resolve);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                position => {
                    setCoordinates([position.coords.longitude, position.coords.latitude]);
                    resolve();
                },
                () => {
                    setCoordinates(null);
                    resolve();
                }
            );
        },
        []
    );

    return { 
        coordinates, 
        loading: !resolved
    };
}