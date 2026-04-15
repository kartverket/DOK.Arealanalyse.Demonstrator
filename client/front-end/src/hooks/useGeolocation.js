import { useEffect, useState } from 'react';
import { getCurrentPosition } from 'utils/map';

export default function useGeolocation() {
    const [coordinates, setCoordinates] = useState();

    useEffect(
        () => {
            (async () => {
                const position = await getCurrentPosition();
                setCoordinates(position);
            })();
        },
        []
    );

    return coordinates;
}

