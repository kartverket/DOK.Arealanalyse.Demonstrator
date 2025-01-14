import { useEffect, useState, useCallback } from 'react';
import { CircularProgress } from '@mui/material';
import { marked } from 'marked';
import { useMap } from 'context/MapContext';
import AboutDataset from './AboutDataset';
import AboutAnalysis from './AboutAnalysis';
import GuidanceLinks from './GuidanceLinks';
import GuidanceText from './GuidanceText';
import QualityMeasurement from './QualityMeasurement';
import PossibleActions from './PossibleActions';
import Data from './Data';
import MapView from 'features/MapView';
import styles from './Result.module.scss';

export default function Result({ inputGeometry, result }) {
    const [mapImageUri, setMapImageUri] = useState(null);
    const [showInteractiveMap, setShowInteractiveMap] = useState(false);
    const { createMapImage } = useMap();

    const shouldShowMap = useCallback(
        () => {
            return result.resultStatus !== 'NO-HIT-GREEN' &&
                result.resultStatus !== 'NO-HIT-YELLOW';
        },
        [result.resultStatus]
    );

    useEffect(
        () => {
            if (!shouldShowMap()) {
                return;
            }

            if (result.rasterResult.imageUri) {
                setMapImageUri(result.rasterResult.imageUri);
                return;
            }

            (async () => {
                const base64 = await createMapImage(inputGeometry, result);
                setMapImageUri(base64);
            })();
        },
        [shouldShowMap, createMapImage, inputGeometry, result]
    );

    return (
        <div>

            {
                result.description ?
                    <div className="section">
                        <div className={styles.content} dangerouslySetInnerHTML={{ __html: marked.parse(result.description) }}></div>
                    </div> :
                    null
            }
            <GuidanceText result={result} />
            <PossibleActions result={result} />

            <div className={styles.grid}>
                <div>
                    {
                        shouldShowMap() ?
                            <div className="paper">
                                <h3>Kartutsnitt</h3>
                                {
                                    showInteractiveMap ?
                                        <MapView inputGeometry={inputGeometry} result={result} /> :
                                        (
                                            mapImageUri !== null ?
                                                <img src={mapImageUri} title="Åpne kart" onClick={() => setShowInteractiveMap(true)} alt="Kartutsnitt" /> :
                                                <div className={styles.loading}>
                                                    <CircularProgress size={32} />
                                                </div>
                                        )
                                }
                            </div> :
                            null
                    }
                    <div className={styles.expandables}>
                        {
                            result.runOnDataset && <AboutDataset result={result} />
                        }
                        <QualityMeasurement result={result} />
                        <AboutAnalysis result={result} />
                    </div>
                </div>
                <div>
                    {
                        result.cartography !== null ?
                            <div className="paper">
                                <h3>Tegneregler</h3>
                                <img src={result.cartography} alt="Tegneregler" />
                            </div> :
                            null
                    }
                    <GuidanceLinks result={result} />
                    {
                        result.data.length > 0 && (
                            <Data result={result} />
                        )
                    }
                </div>
            </div>
        </div>
    );
}