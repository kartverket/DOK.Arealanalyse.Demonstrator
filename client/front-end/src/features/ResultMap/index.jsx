import { useEffect, useRef, useState } from 'react';
import { createMapImage } from 'utils/map';
import styles from './ResultMap.module.scss';

export default function ResultMap({ result }) {
    const [mapImageUri, setMapImageUri] = useState(null);
    const cacheRef = useRef(new Map());

    useEffect(
        () => {
            (async () => {
                let imageUri = result.data.rasterResult.imageUri;
                
                if (!imageUri) {
                    imageUri = cacheRef.current.get(result.id);

                    if (!imageUri) {
                        imageUri = await createMapImage(result.data, { width: 595, height: 335 });
                        cacheRef.current.set(result.id, imageUri);
                    }
                }

                setMapImageUri(imageUri);
            })();
        },
        [result]
    );

    if (mapImageUri === null) {
        return null;
    }

    return (
        <img
            src={mapImageUri}
            // title="Åpne kart"
            // onClick={() => setShowInteractiveMap(true)}
            className={styles.map}
            alt="Kartutsnitt"
        />
    )
}