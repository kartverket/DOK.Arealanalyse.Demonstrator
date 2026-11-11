import Expand from '../Expand/Expand';
import MapView from '@/components/Map/MapView/MapView';
import { MapControl } from '@/components/Map/Map.constants';
import basemap from '@/config/basemap.config';
import type { AnalysisResult } from '@/types/api.types';
import type { CrsGeometry } from '@/types/geo.types';

interface ResultMapViewProps {
    result: AnalysisResult;
    inputGeometry: CrsGeometry;
    controls?: MapControl[];
    className?: string;
}

export default function ResultMapView({ result, inputGeometry, controls = [], className }: ResultMapViewProps) {
    return (
        <MapView
            geometry={inputGeometry}
            bufferedGeometry={result.buffer > 0 ? result.runOnInputGeometry : null}
            wmtsLayer={basemap.layers.topograatone}
            wmsUrl={result.rasterResult.mapUri}
            controls={controls}
            className={className}
        >
            {
                controls.includes(MapControl.EXPAND) && (
                    <Expand />
                )
            }
        </MapView>
    );
}
