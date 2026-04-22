import { useEffect, useMemo, useState } from 'react';
import { createMapImage } from 'utils/map';
import caching from 'utils/mapImageCache';
import { getGeometries } from './helpers';
import { Skeleton } from '@digdir/designsystemet-react';
import styles from './Map.module.scss';
import basemap from 'config/basemap.config';
import MapView from '../MapView';
import { DatafunnButton } from 'components';

const MAP_WIDTH = 1280;
const MAP_HEIGHT = 720;

export default function Map({ inputGeometry, buffer, mapImageUri, cacheKey }) {
    const [_mapImageUri, setMapImageUri] = useState(null);
    const [showInteractiveMap, setShowInteractiveMap] = useState(false);

    const { geometry, bufferedGeometry } = useMemo(
        () => getGeometries(inputGeometry, buffer),
        [inputGeometry, buffer]
    );

    useEffect(
        () => {
            (async () => {
                let imageUri = mapImageUri;

                if (imageUri === null) {
                    imageUri = caching.getMapImage(cacheKey);

                    if (imageUri === null) {
                        imageUri = await createMapImage({
                            geometry,
                            bufferedGeometry,
                            wmtsLayer: basemap.layers.topo,
                            options: {
                                width: MAP_WIDTH,
                                height: MAP_HEIGHT,
                                constrainResolution: false
                            }
                        });

                        caching.setMapImage(cacheKey, imageUri);
                    }
                }

                setMapImageUri(imageUri);
            })();
        },
        [geometry, bufferedGeometry, mapImageUri, cacheKey]
    );

    function renderMap() {
        if (!showInteractiveMap) {
            return (
                <div className={styles.mapImage}>
                    <img
                        src={_mapImageUri}
                        onClick={() => setShowInteractiveMap(true)}
                        title="Åpne interaktivt kart"
                        aria-label="Åpne interaktivt kart"
                        alt="Kartutsnitt"
                        role="button"
                        className={styles.mapImage}
                    />

                    <DatafunnButton
                        inputGeometry={geometry}
                        className={styles.datafunn}
                    />
                </div>
            );
        }

        return (
            <div className={styles.map}>
                <MapView
                    geometry={geometry}
                    bufferedGeometry={bufferedGeometry}
                />

                <DatafunnButton
                    inputGeometry={geometry}
                    className={styles.datafunn}
                />
            </div>
        );
    }

    return _mapImageUri === null ?
        <Skeleton className={styles.skeleton} /> :
        renderMap()
}