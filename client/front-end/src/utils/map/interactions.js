import { Draw, Select } from 'ol/interaction';
import DrawHole from 'ol-ext/interaction/DrawHole';
import ModifyFeature from 'ol-ext/interaction/ModifyFeature';
import UndoRedo from 'ol-ext/interaction/UndoRedo';
import { Vector as VectorSource } from 'ol/source';
import { multiPolygon as createMultiPolygon } from '@turf/helpers';
import { interactionType } from './constants';
import { getFeature, getLayer, readGeometry, writeGeometryObject } from './helpers';
import { createDrawStyle, createEditStyle, createModifyStyle } from './styles';
import { setFeature } from './features';
import { setSelectedGeometry, setUndoRedo, setValid } from 'store/slices/areaMapSlice';
import store from 'store';
import { api, apiFetch } from 'store/api';
import { setToast } from 'store/slices/appSlice';

export function addInteractions(map) {
    addDrawPolygonInteraction(map);
    addDrawPolygonHoleInteraction(map);
    addModifyInteraction(map);
    addSelectInteraction(map);
    addUndoRedoInteraction(map);
}

export function getInteraction(map, name) {
    return map.getInteractions()
        .getArray()
        .find(interaction => interaction.get('_name') === name) || null;
}

function addDrawPolygonInteraction(map) {
    if (getInteraction(map, interactionType.DrawPolygon) !== null) {
        return;
    }

    const source = new VectorSource();

    const interaction = new Draw({
        source,
        type: 'Polygon',
        style: createDrawStyle()
    });

    interaction.on('drawend', event => {
        source.clear();

        const existingFeature = getFeature(map, 'feature');

        const existingGeometry = existingFeature !== null ?
            writeGeometryObject(existingFeature.getGeometry()) :
            null;

        const newFeature = event.feature;
        let newGeometry;

        if (existingGeometry !== null) {
            const drawnGeometry = writeGeometryObject(newFeature.getGeometry());

            const coordinates = existingGeometry.type === 'MultiPolygon' ?
                [...existingGeometry.coordinates, drawnGeometry.coordinates] :
                [existingGeometry.coordinates, drawnGeometry.coordinates];

            const multiPolygon = createMultiPolygon(coordinates);
            newGeometry = readGeometry(multiPolygon.geometry);

            existingFeature.setGeometry(newGeometry);
        } else {
            newGeometry = newFeature.getGeometry();
            setFeature(map, 'feature', newFeature);
        }

        // const geoJson = writeGeometryObject(newGeometry, { precision: 2 });
        // addCrsName(geoJson, DEFAULT_EPSG);

        // store.dispatch(setFormData({ name: 'inputGeometry', value: geoJson }));

        const undoRedoInteraction = getInteraction(map, interactionType.UndoRedo);

        if (undoRedoInteraction !== null) {
            undoRedoInteraction.push('replaceGeometry', {
                before: existingGeometry,
                after: writeGeometryObject(newGeometry),
            });
        }
    });

    interaction.set('_name', interactionType.DrawPolygon);
    interaction.setActive(false);

    map.addInteraction(interaction);
}

function addDrawPolygonHoleInteraction(map) {
    if (getInteraction(map, interactionType.DrawPolygonHole) !== null) {
        return;
    }

    const layer = getLayer(map, 'feature');

    const interaction = new DrawHole({
        layers: [layer],
        style: createDrawStyle(),
    });

    interaction.set('_name', interactionType.DrawPolygonHole);
    interaction.setActive(false);

    map.addInteraction(interaction);
}

function addModifyInteraction(map) {
    if (getInteraction(map, interactionType.ModifyGeometry) !== null) {
        return;
    }

    const layer = getLayer(map, 'feature');
    const source = layer.getSource();

    const interaction = new ModifyFeature({
        source,
        style: createModifyStyle()
    });

    interaction.set('_name', interactionType.ModifyGeometry);
    interaction.setActive(false);

    map.addInteraction(interaction);
}

function addSelectInteraction(map) {
    if (getInteraction(map, interactionType.SelectGeometry) !== null) {
        return;
    }

    const layer = getLayer(map, 'feature');

    const interaction = new Select({
        layers: [layer],
        style: createEditStyle()
    });

    interaction.on('select', event => {
        const feature = event.selected[0] || null;
        const geometry = feature !== null ?
            writeGeometryObject(feature.getGeometry()) :
            null;

        store.dispatch(setSelectedGeometry(geometry));
    });

    interaction.set('_name', interactionType.SelectGeometry);
    interaction.setActive(false);

    map.addInteraction(interaction);
}

function addUndoRedoInteraction(map) {
    if (getInteraction(map, interactionType.UndoRedo) !== null) {
        return;
    }

    const layer = getLayer(map, 'feature');

    const interaction = new UndoRedo({
        layers: [layer],
    });

    addCustomUndoRedo(interaction, map);

    interaction.on('stack:add', () => handleStackAddRemove(interaction, map));

    interaction.on('stack:remove', () => handleStackAddRemove(interaction, map));

    interaction.on('stack:clear', () => {
        store.dispatch(setUndoRedo({ hasUndo: false, hasRedo: false }));
    });

    interaction.set('_name', interactionType.UndoRedo);
    interaction.setActive(true);

    map.addInteraction(interaction);
}

function addCustomUndoRedo(interaction, map) {
    let _geometry;

    interaction.define(
        'replaceGeometry',
        (event) => {
            _geometry = event.before;
        },
        (event) => {
            _geometry = event.after;
        }
    );

    interaction.on(['undo', 'redo'], (event) => {
        if (event.action.type === 'replaceGeometry') {
            const feature = getFeature(map, 'feature');
            feature.setGeometry(readGeometry(_geometry));
        }
    });
}

function handleStackAddRemove(interaction, map) {
    setTimeout(async () => {
        const hasUndo = hasUndoRedo(interaction.getStack());
        const hasRedo = hasUndoRedo(interaction.getStack('redo'));

        store.dispatch(setUndoRedo({ hasUndo, hasRedo }));

        await validateGeometry(map);
    }, 0);
}

async function validateGeometry(map) {
    const geometry = getGeometry(map)

    if (geometry === null) {
        return;
    }

    const { valid, message } = await apiFetch(api.endpoints.validate, { geometry });
    store.dispatch(setValid(valid));
}

function getGeometry(map) {
    const feature = getFeature(map, 'feature');

    return writeGeometryObject(feature?.getGeometry() || null);
}

function hasUndoRedo(stack) {
    return stack
        .filter(item => ['blockstart', 'replaceGeometry'].includes(item.type))
        .length > 0;
}
