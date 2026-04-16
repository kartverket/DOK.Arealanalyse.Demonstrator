import { useRef } from 'react';
import _UndoRedo from 'ol-ext/interaction/UndoRedo';
import styles from '../Editor.module.scss';
import { getEditLayer } from 'utils/map';
import { getFeature, getInteraction, readGeometry } from 'utils/map/helpers';

export default function UndoRedo({ map }) {
    const interactionRef = useRef(getInteraction(map, UndoRedo.name));

    function undo() {
        interactionRef.current.undo();
    }

    function redo() {
        interactionRef.current.redo();
    }

    return (
        <>
            <button className={styles.undo} onClick={undo} title='Angre'></button>
            <button
                className={styles.redo}
                onClick={redo}
                title='Gjør om'
            ></button>
        </>
    );
}

UndoRedo.addInteraction = (map) => {
    if (getInteraction(map, UndoRedo.name) !== null) {
        return;
    }

    const vectorLayer = getEditLayer(map);

    const interaction = new _UndoRedo({
        layers: [vectorLayer],
    });

    addCustomUndoRedo(interaction, map);

    interaction.set('_name', UndoRedo.name);
    interaction.setActive(true);

    map.addInteraction(interaction);
};

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
            const feature = getFeature(map);
            feature.setGeometry(readGeometry(_geometry));
        }
    });
}
