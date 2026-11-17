import { useEffect, useRef, useState } from 'react';
import { Feature } from 'ol';
import { api } from '@/lib/api/api';
import { createMap, getLayer, readGeometry } from '@/lib/map/map';
import AddressSearch from '../AddressSearch/AddressSearch';
import {
    createEditorController,
    type EditorController,
    type EditorHistory,
    type EditorTool,
} from '../AreaEditor.interactions';
import Toolbar from '../Toolbar/Toolbar';
import { apiFetch } from '@/app/apiFetch';
import { setArea } from '@/app/appSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import basemap from '@/config/basemap.config';
import {
    setupMap,
    zoomToExtent,
    zoomToFeatures,
    zoomToLocation,
    zoomToPoint,
} from '../../AreaPreview/MapView/MapView.helpers';
import { getDrawnTitle } from '../../AreaSelector/AreaSelector.helpers';
import {
    createAddressLayer,
    downloadGeometry,
    geometryToFile,
    getEditedAreaName,
    getEditorStyle,
    NORWAY_EXTENT,
    OUTPUT_EPSG,
    setAddressMarker,
    writeGeometry,
} from '../AreaEditor.helpers';
import Zoom from '@/components/Map/Zoom/Zoom';
import ZoomToExtent from '@/components/Map/ZoomToExtent/ZoomToExtent';
import { Button } from 'dibk-designsystemet';
import styles from './Editor.module.scss';

import type { CrsGeometry, LonLat } from '@/types/geo.types';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';

// Holder området fri for søkefeltet, verktøylinjen og zoomknappene som ligger over kartet
const VIEW_PADDING = [90, 80, 90, 40];

// Viser gatene rundt adressen, ikke bare bygningen
const ADDRESS_ZOOM = 15;

interface EditorProps {
    // null når et nytt område skal tegnes
    geometry: CrsGeometry | null;
    currentLocation: LonLat | null;
    onClose: () => void;
}

export default function Editor({
    geometry,
    currentLocation,
    onClose,
}: EditorProps) {
    const area = useAppSelector((state) => state.app.area);
    const [map, setMap] = useState<OlMap | null>(null);
    const [editor, setEditor] = useState<EditorController | null>(null);
    const [activeTool, setActiveTool] = useState<EditorTool | null>(
        geometry !== null ? 'select' : 'draw',
    );
    const [selected, setSelected] = useState(false);
    const [hasGeometry, setHasGeometry] = useState(geometry !== null);
    const [history, setHistory] = useState<EditorHistory>({
        canUndo: false,
        canRedo: false,
    });
    const [saving, setSaving] = useState(false);
    const mapElementRef = useRef<HTMLDivElement>(null);
    const addressLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

    // Leses bare når kartet lages, så en posisjon som kommer senere ikke nullstiller redigeringen
    const initialRef = useRef({ geometry, currentLocation });
    const dispatch = useAppDispatch();

    // Kartet lages når dialogen åpnes
    useEffect(() => {
        const { geometry, currentLocation } = initialRef.current;
        let olMap: OlMap | null = null;
        let cancelled = false;

        (async () => {
            const created = await createMap({
                geometry: null,
                wmtsLayer: basemap.layers.topograatone,
            });

            if (cancelled) {
                created.dispose();
                return;
            }

            const layer = getLayer<VectorLayer<VectorSource>>(
                created,
                'features',
            )!;
            layer.setStyle(getEditorStyle());

            const initial = geometry !== null ? readGeometry(geometry) : null;
            if (initial) {
                layer.getSource()!.addFeature(new Feature(initial));
            }

            const addressLayer = createAddressLayer();
            created.addLayer(addressLayer);
            addressLayerRef.current = addressLayer;

            created.setTarget(mapElementRef.current ?? undefined);
            setupMap(created);
            created.getView().padding = VIEW_PADDING;

            if (initial) {
                zoomToFeatures(created);
            } else if (currentLocation !== null) {
                zoomToLocation(created, currentLocation);
            } else {
                zoomToExtent(created, NORWAY_EXTENT);
            }

            const controller = createEditorController(created, layer, {
                onSelectionChange: setSelected,
                onHistoryChange: setHistory,
                onGeometryChange: setHasGeometry,
            });
            controller.setTool(geometry !== null ? 'select' : 'draw');

            olMap = created;
            setMap(created);
            setEditor(controller);
        })();

        return () => {
            cancelled = true;
            olMap?.dispose();
        };
    }, []);

    function handleToolChange(tool: EditorTool | null) {
        editor?.setTool(tool);
        setActiveTool(tool);
    }

    function handleAddressSelect(coordinates: LonLat | null) {
        if (addressLayerRef.current !== null) {
            setAddressMarker(addressLayerRef.current, coordinates);
        }

        if (map !== null && coordinates !== null) {
            zoomToPoint(map, coordinates, ADDRESS_ZOOM);
        }
    }

    function getEditedGeometry(): CrsGeometry | null {
        const edited = editor?.getGeometry() ?? null;
        return edited !== null ? writeGeometry(edited) : null;
    }

    function handleDownload() {
        const edited = getEditedGeometry();
        if (edited !== null) {
            downloadGeometry(edited);
        }
    }

    async function handleSave() {
        const edited = getEditedGeometry();
        if (edited === null) {
            return;
        }

        setSaving(true);

        try {
            // /omrade validerer geometrien og finner kommunen den ligger i
            const feature = await apiFetch(api.endpoints.getOmråde, {
                file: geometryToFile(edited),
                epsg: OUTPUT_EPSG,
            });

            if (feature !== null) {
                const name = geometry !== null ? getEditedAreaName(area) : null;
                dispatch(
                    setArea({
                        geometry: feature.geometry,
                        title: getDrawnTitle(name, feature.properties),
                        source: { type: 'drawn', name },
                    }),
                );

                onClose();
            }
        } catch (error) {
            console.log(error);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={styles.editor}>
            <div className={styles.mapContainer}>
                <div
                    ref={mapElementRef}
                    className={styles.map}
                ></div>

                {map !== null && editor !== null && (
                    <>
                        <div className={styles.search}>
                            <AddressSearch onSelect={handleAddressSelect} />
                        </div>

                        <div className={styles.toolbar}>
                            <Toolbar
                                editor={editor}
                                activeTool={activeTool}
                                selected={selected}
                                hasGeometry={hasGeometry}
                                history={history}
                                onToolChange={handleToolChange}
                                onDownload={handleDownload}
                            />
                        </div>

                        <div className={styles.buttons}>
                            <Zoom map={map} />
                            <ZoomToExtent map={map} />
                        </div>
                    </>
                )}
            </div>

            <div className={styles.actions}>
                <Button
                    onClick={handleSave}
                    disabled={!hasGeometry || saving}
                    loading={saving}
                >
                    Lagre
                </Button>

                <Button
                    onClick={onClose}
                    variant="secondary"
                >
                    Avbryt
                </Button>
            </div>
        </div>
    );
}
