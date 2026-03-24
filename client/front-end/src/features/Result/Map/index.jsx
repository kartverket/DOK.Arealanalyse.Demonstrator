import { useEffect, useState } from 'react';
import { createMapImage } from 'utils/map';
import caching from 'utils/mapImageCache';
import { Heading, Skeleton } from '@digdir/designsystemet-react';
import { MapView } from 'features';
import styles from './Map.module.scss';

const MAP_WIDTH = 656;
const MAP_HEIGHT = 335;

export default function Map({ result, inputGeometry }) {
    const [mapImageUri, setMapImageUri] = useState(null);
    const [showInteractiveMap, setShowInteractiveMap] = useState(false);

    useEffect(
        () => {
            (async () => {
                const data = result.data;
                let imageUri = data.rasterResult.imageUri;

                if (!imageUri) {
                    imageUri = caching.getMapImage(result.id);

                    if (imageUri === null) {
                        imageUri = await createMapImage({
                            geometry: inputGeometry,
                            bufferedGeometry: data.buffer > 0 ? data.runOnInputGeometry : null,
                            wmsUrl: data.rasterResult.mapUri,
                            options: {
                                width: MAP_WIDTH,
                                height: MAP_HEIGHT
                            }
                        });
                        
                        caching.setMapImage(result.id, imageUri);
                    }
                }

                setMapImageUri(imageUri);
            })();
        },
        [result, inputGeometry]
    );

    function renderMap() {
        if (!showInteractiveMap) {
            return (
                <img
                    src={mapImageUri}
                    title="Åpne kart"
                    onClick={() => setShowInteractiveMap(true)}
                    alt="Kartutsnitt"
                    role="button"
                    className={styles.mapImage}
                />
            );
        }

        return (
            <div className={styles.map}>
                <MapView
                    result={result.data}
                    inputGeometry={result.data.runOnInputGeometry}
                />
            </div>
        );
    }

    return (
        <div className={styles.mapContainer}>
            <Heading level={3}>Kartvisning</Heading>
            {
                mapImageUri === null ?
                    <Skeleton
                        width={MAP_WIDTH}
                        height={MAP_HEIGHT}
                        className={styles.skeleton}
                    /> :
                    renderMap()
            }

            <Heading level={5}>Tegneregler</Heading>

            <div className={styles.legend}>
                <div className={styles.imgWrapper}>
                    <img src={result.data.cartography} alt="Tegneregler" />
                </div>
            </div>
        </div>
    );
}