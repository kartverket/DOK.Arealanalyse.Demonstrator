import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
// import DeleteGeometry from './DeleteGeometry';
import DrawPolygon from './DrawPolygon';
import DrawPolygonHole from './DrawPolygonHole';
// import DrawLineString from './DrawLineString';
import ModifyGeometry from './ModifyGeometry';
import SelectGeometry from './SelectGeometry';
import UndoRedo from './UndoRedo';
import styles from './Editor.module.scss';
import { GeometryType } from './helpers';
import { getEditLayer, getLayer } from 'utils/map';
import { getFeature, getFeaturesLayer, getInteraction, writeGeometryObject } from 'utils/map/helpers';
import { createFeature, setFeature } from 'utils/map/features';
import DeleteGeometry from './DeleteGeometry';
import { polygon as createPolygon } from '@turf/helpers';
import { MAP_EPSG } from 'utils/map/constants';

export default function Editor({ map }) {
    const [active, setActive] = useState(null);
    const geomType = GeometryType.Polygon
    // const geomType = useSelector((state) => state.geomEditor.geomType);

    // useEffect(
    //     () => {
    //         if (map === null) {
    //             return;
    //         }

    //         const undoRedoInteraction = getInteraction(map, UndoRedo.name);
    //         undoRedoInteraction.clear();
    //     },
    //     [map]
    // );

    // useEffect(
    //     () => {
    //         if (map === null) {
    //             return;
    //         }

    //         if (geomType === GeometryType.Polygon) {
    //             setActive(DrawPolygon.name);
    //         } else {
    //             setActive(null);
    //         }

    //         const undoRedoInteraction = getInteraction(map, UndoRedo.name);
    //         undoRedoInteraction.clear();
    //     },
    //     [geomType, map]
    // );

    // const initRef = useRef(true);

    // useEffect(
    //     () => {
    //         if (map === null || !initRef.current) {
    //             return;
    //         }

    //         initRef.current = false;
    //         const featuresLayer = getFeaturesLayer(map);
    //         featuresLayer.setVisible(false);

    //         const features = featuresLayer.getSource().getFeatures();

    //         if (!features.length) {
    //             return;
    //         }

    //         const editLayer = getEditLayer(map);
    //         editLayer.getSource().addFeature(features[0]);
    //     },
    //     [map]
    // )

    const [editMode, setEditMode] = useState(false);

    function toggleEditMode() {
        setEditMode(!editMode);

        // const layer = getLayer(map, 'feature');
        // const source = layer.getSource();
        // const feature = source.getFeatures()[0];
        // const geometry = feature?.getGeometry();

        // if (geometry === null || geometry.getType() !== GeometryType.MultiPolygon) {
        //     return;
        // }

        // source.clear();

        // const geoJson = writeGeometryObject(geometry);
        // const features = [];

        // geoJson.coordinates.forEach(coords => {
        //     const polygon = createPolygon(coords);
        //     features.push(createFeature(polygon.geometry, MAP_EPSG));
        // });

        // source.addFeatures(features);

        const undoRedoInteraction = getInteraction(map, UndoRedo.name);

        undoRedoInteraction.clear();
    }

    function handleClick(name) {
        setActive(name);
    }

    if (map === null) {
        return null;
    }

    return (
        <div
            className={styles.editor}
            style={{ display: geomType !== null ? 'flex' : 'none' }}
        >
            <button onClick={toggleEditMode} style={{ background: editMode ? 'green' : 'none' }}>
                Rediger
            </button>

            {
                editMode && (
                    <>
                        <SelectGeometry
                            map={map}
                            active={active}
                            onClick={handleClick}
                        />

                        <DrawPolygon
                            map={map}
                            active={active}
                            onClick={handleClick}
                        />

                        <DrawPolygonHole
                            map={map}
                            active={active}
                            onClick={handleClick}
                        />

                        {/* 
         <div
            style={{
               display: geomType === GeometryType.Polygon ? 'flex' : 'none',
            }}
         >
            <DrawPolygon map={map} active={active} onClick={handleClick} />
            <DrawPolygonHole map={map} active={active} onClick={handleClick} />
         </div>

         <div
            style={{
               display: geomType === GeometryType.LineString ? 'flex' : 'none',
            }}
         >
            <DrawLineString map={map} active={active} onClick={handleClick} />
         </div>*/}

                        {/* <ModifyGeometry
                map={map}
                active={active}
                onClick={handleClick}
            /> */}

                        {/* <div className={styles.separator} />

         

         <div className={styles.separator} /> */}

                        <UndoRedo map={map} />

                        <DeleteGeometry map={map} />
                    </>
                )
            }

        </div>
    );
}
