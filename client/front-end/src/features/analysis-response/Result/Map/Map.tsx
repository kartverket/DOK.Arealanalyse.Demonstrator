import { useEffect, useState } from 'react';
import { createMapImage } from '@/lib/map/map';
import caching from '@/lib/map/mapImageCache';
import Expand from '../Expand/Expand';
import ResultMapView from '../MapView/MapView';
import basemap from '@/config/basemap.config';
import DatafunnButton from '@/components/DatafunnButton/DatafunnButton';
import { MapControl } from '@/components/Map/Map.constants';
import { Heading, Skeleton } from 'dibk-designsystemet';
import styles from './Map.module.scss';

import type { ResultItem } from '@/types/analysis.types';
import type { CrsGeometry } from '@/types/geo.types';

const MAP_WIDTH = 681;
const MAP_HEIGHT = 335;

interface MapProps {
    result: ResultItem;
    inputGeometry: CrsGeometry;
}

export default function Map({ result, inputGeometry }: MapProps) {
    const [mapImageUri, setMapImageUri] = useState<string | null>(null);
    const [showInteractiveMap, setShowInteractiveMap] = useState(false);

    useEffect(() => {
        (async () => {
            const data = result.data;
            let imageUri = data.rasterResult.imageUri;
            if (!imageUri) {
                imageUri = caching.getMapImage(result.id);
                if (imageUri === null) {
                    imageUri = await createMapImage({
                        geometry: inputGeometry,
                        bufferedGeometry:
                            data.buffer > 0 ? data.runOnInputGeometry : null,
                        wmsUrl: data.rasterResult.mapUri,
                        wmtsLayer: basemap.layers.topograatone,
                        options: {
                            width: MAP_WIDTH,
                            height: MAP_HEIGHT,
                        },
                    });

                    caching.setMapImage(result.id, imageUri);
                }
            }

            setMapImageUri(imageUri);
        })();
    }, [result, inputGeometry]);

    function renderMap() {
        if (!showInteractiveMap) {
            return (
                <div className={styles.mapImage}>
                    <img
                        src={mapImageUri ?? undefined}
                        onClick={() => setShowInteractiveMap(true)}
                        title="Åpne interaktivt kart"
                        aria-label="Åpne interaktivt kart"
                        alt="Kartutsnitt"
                        role="button"
                    />

                    <div className={styles.buttons}>
                        <Expand />
                    </div>

                    <DatafunnButton
                        inputGeometry={inputGeometry}
                        className={styles.datafunn}
                    />
                </div>
            );
        }

        return (
            <div className={styles.map}>
                <ResultMapView
                    result={result.data}
                    inputGeometry={inputGeometry}
                    controls={[
                        MapControl.ZOOM,
                        MapControl.ZOOM_TO_EXTENT,
                        MapControl.EXPAND,
                    ]}
                />

                <DatafunnButton
                    inputGeometry={inputGeometry}
                    className={styles.datafunn}
                />
            </div>
        );
    }

    return (
        <div className={styles.mapContainer}>
            <Heading level={3}>Kartvisning</Heading>
            {mapImageUri === null ? (
                <Skeleton
                    width={MAP_WIDTH}
                    height={MAP_HEIGHT}
                    className={styles.skeleton}
                />
            ) : (
                renderMap()
            )}

            <Heading level={5}>Tegneregler</Heading>

            <div className={styles.legend}>
                <div className={styles.imgWrapper}>
                    <img
                        src={result.data.cartography ?? undefined}
                        alt="Tegneregler"
                    />
                </div>
            </div>
        </div>
    );
}
