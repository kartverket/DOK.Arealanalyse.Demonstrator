import { useRef } from 'react';
import { getFeaturesLayer, getInteraction } from 'utils/map/helpers';
import { createDrawStyle } from 'utils/map/styles';
import DrawHole from 'ol-ext/interaction/DrawHole';
import styles from '../Editor.module.scss';

export default function DrawPolygonHole({ map, active, onClick }) {
    const interactionRef = useRef(getInteraction(map, DrawPolygonHole.name));
    const isActive = active === DrawPolygonHole.name;

    interactionRef.current.setActive(isActive);

    function toggle() {
        onClick(!isActive ? DrawPolygonHole.name : null);
    }

    return (
        <button
            className={`${styles.polygonHole} ${isActive ? styles.active : ''}`}
            onClick={toggle}
            title='Legg til hull'
        >Hull</button>
    );
}

DrawPolygonHole.addInteraction = (map) => {
    if (getInteraction(map, DrawPolygonHole.name) !== null) {
        return;
    }

    const vectorLayer = getFeaturesLayer(map);

    const interaction = new DrawHole({
        layers: [vectorLayer],
        style: createDrawStyle(),
    });

    interaction.set('_name', DrawPolygonHole.name);
    interaction.setActive(false);

    map.addInteraction(interaction);
};
