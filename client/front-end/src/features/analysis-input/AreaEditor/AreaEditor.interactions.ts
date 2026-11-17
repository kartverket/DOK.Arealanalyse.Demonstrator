import { Feature } from 'ol';
import DrawHole from 'ol-ext/interaction/DrawHole';
import ModifyFeature from 'ol-ext/interaction/ModifyFeature';
import UndoRedo from 'ol-ext/interaction/UndoRedo';
import { Draw, Select } from 'ol/interaction';
import { unionGeometries } from './AreaEditor.helpers';

import type Geometry from 'ol/geom/Geometry';
import type Interaction from 'ol/interaction/Interaction';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';

export type EditorTool = 'select' | 'draw' | 'drawHole' | 'modify';

export interface EditorHistory {
    canUndo: boolean;
    canRedo: boolean;
}

export interface EditorController {
    setTool: (tool: EditorTool | null) => void;
    deleteSelected: () => void;
    clear: () => void;
    undo: () => void;
    redo: () => void;
    getGeometry: () => Geometry | null;
}

interface EditorListeners {
    onSelectionChange: (selected: boolean) => void;
    onHistoryChange: (history: EditorHistory) => void;
    onGeometryChange: (hasGeometry: boolean) => void;
}

interface ReplaceGeometry {
    feature: Feature;
    before: Geometry;
    after: Geometry;
}

const REPLACE_GEOMETRY = 'replaceGeometry';

// Analyseområdet er alltid ett objekt i laget, så nye polygoner slås sammen med det som finnes
export function createEditorController(
    map: OlMap,
    layer: VectorLayer<VectorSource>,
    { onSelectionChange, onHistoryChange, onGeometryChange }: EditorListeners,
): EditorController {
    const source = layer.getSource()!;
    const select = new Select({ layers: [layer] });
    const draw = new Draw({ type: 'Polygon' });
    const drawHole = new DrawHole({ layers: [layer] });
    const modify = new ModifyFeature({ source });
    const undoRedo = new UndoRedo({ layers: [layer] });

    const tools: Record<EditorTool, Interaction> = {
        select,
        draw,
        drawHole,
        modify,
    };

    // Geometriene klones, så endringer gjort med ModifyFeature ikke endrer historikken
    undoRedo.define<ReplaceGeometry>(
        REPLACE_GEOMETRY,
        ({ feature, before }) => feature.setGeometry(before.clone()),
        ({ feature, after }) => feature.setGeometry(after.clone()),
    );

    draw.on('drawend', (event) => {
        const drawn = event.feature.getGeometry();
        if (drawn === undefined) {
            return;
        }

        const existing = source.getFeatures()[0];
        if (existing === undefined) {
            source.addFeature(new Feature(drawn));
            return;
        }

        const before = existing.getGeometry()!.clone();
        const after = unionGeometries(before, drawn);
        existing.setGeometry(after.clone());
        undoRedo.push(REPLACE_GEOMETRY, { feature: existing, before, after });
    });

    select.on('select', () => {
        onSelectionChange(select.getFeatures().getLength() > 0);
    });

    undoRedo.on(['stack:add', 'stack:remove', 'stack:clear'], () => {
        onHistoryChange({
            canUndo: undoRedo.length() > 0,
            canRedo: undoRedo.length('redo') > 0,
        });
    });

    source.on('change', () => {
        onGeometryChange(source.getFeatures().length > 0);
    });

    Object.values(tools).forEach((interaction) => {
        interaction.setActive(false);
        map.addInteraction(interaction);
    });

    map.addInteraction(undoRedo);

    function clearSelection() {
        select.getFeatures().clear();
        onSelectionChange(false);
    }

    return {
        setTool(tool) {
            clearSelection();

            Object.entries(tools).forEach(([name, interaction]) => {
                interaction.setActive(name === tool);
            });
        },
        deleteSelected() {
            select.getFeatures().forEach((feature) => {
                source.removeFeature(feature);
            });

            clearSelection();
        },
        clear() {
            clearSelection();
            source.clear();
        },
        undo() {
            clearSelection();
            undoRedo.undo();
        },
        redo() {
            clearSelection();
            undoRedo.redo();
        },
        getGeometry() {
            return source.getFeatures()[0]?.getGeometry() ?? null;
        },
    };
}
