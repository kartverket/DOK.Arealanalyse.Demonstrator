import { useRef } from 'react';
import { Draw } from 'ol/interaction';
import { multiPolygon as createMultiPolygon } from '@turf/helpers';
import UndoRedo from '../UndoRedo';
import styles from '../Editor.module.scss';
import { addCrsName, getFeature, getInteraction, readGeometry, writeGeometryObject } from 'utils/map/helpers';
import { createDrawStyle } from 'utils/map/styles';
import { GeometryType } from '../helpers';
import { Vector as VectorSource } from 'ol/source';
import { setFeature } from 'utils/map/features';
import store from 'store';
import { setFormData } from 'store/slices/appSlice';
import { DEFAULT_EPSG } from 'utils/constants';

export default function DrawPolygon({ map, active, onClick }) {
    const interactionRef = useRef(getInteraction(map, DrawPolygon.name));
    const isActive = active === DrawPolygon.name;

    interactionRef.current.setActive(isActive);

    function toggle() {
        onClick(!isActive ? DrawPolygon.name : null);
    }

    return (
        <button
            className={`${styles.polygon} ${isActive ? styles.active : ''}`}
            onClick={toggle}
            title='Legg til polygon'
        >Legg til polygon</button>
    );
}

DrawPolygon.addInteraction = map => {
    if (getInteraction(map, DrawPolygon.name) !== null) {
        return;
    }

    const source = new VectorSource();

    const interaction = new Draw({
        source,
        type: GeometryType.Polygon,
        style: createDrawStyle()
    });

    interaction.on('drawend', event => {
        source.clear();

        const existingFeature = getFeature(map);

        const existingGeometry = existingFeature !== null ?
            writeGeometryObject(existingFeature.getGeometry()) :
            null;

        const newFeature = event.feature;
        let newGeometry;

        if (existingGeometry !== null) {
            const drawnGeometry = writeGeometryObject(newFeature.getGeometry());

            const coordinates = existingGeometry.type === GeometryType.MultiPolygon ?
                [...existingGeometry.coordinates, drawnGeometry.coordinates] :
                [existingGeometry.coordinates, drawnGeometry.coordinates];

            const multiPolygon = createMultiPolygon(coordinates);
            newGeometry = readGeometry(multiPolygon.geometry);

            existingFeature.setGeometry(newGeometry);
        } else {
            newGeometry = newFeature.getGeometry();
            setFeature(map, newFeature);
        }

        // const geoJson = writeGeometryObject(newGeometry, { precision: 2 });
        // addCrsName(geoJson, DEFAULT_EPSG);

        // store.dispatch(setFormData({ name: 'inputGeometry', value: geoJson }));

        const undoRedoInteraction = getInteraction(map, UndoRedo.name);

        undoRedoInteraction.push('replaceGeometry', {
            before: existingGeometry,
            after: writeGeometryObject(newGeometry),
        });
    });

    interaction.set('_name', DrawPolygon.name);
    interaction.setActive(false);

    map.addInteraction(interaction);
};
