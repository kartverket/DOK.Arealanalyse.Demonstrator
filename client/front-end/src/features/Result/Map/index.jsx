import { useEffect, useState } from 'react';
import { createMapImage } from 'utils/map';
import caching from 'utils/mapImageCache';
import { Heading, Skeleton } from '@digdir/designsystemet-react';
import { MapView } from 'features';
import { Expand, MapControl } from 'components/Map';
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
                <div className={styles.mapImage}>
                    <img
                        src={mapImageUri}
                        onClick={() => setShowInteractiveMap(true)}
                        title="Åpne interaktivt kart"
                        aria-label="Åpne interaktivt kart"
                        alt="Kartutsnitt"
                        role="button"
                        className={styles.mapImage}
                    />

                    <div className={styles.buttons}>
                        <Expand />
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.map}>
                <MapView
                    result={result.data}
                    inputGeometry={result.data.runOnInputGeometry}
                    controls={[
                        MapControl.ZOOM,
                        MapControl.ZOOM_TO_EXTENT,
                        MapControl.EXPAND
                    ]}
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