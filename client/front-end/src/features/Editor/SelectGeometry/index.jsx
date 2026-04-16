import { useRef } from 'react';
import { Select } from 'ol/interaction';
import { getLayer } from 'utils/map';
import { getInteraction } from 'utils/map/helpers';
import { createEditStyle } from 'utils/map/styles';
import styles from '../Editor.module.scss';

export default function SelectGeometry({ map, active, onClick }) {
    const interactionRef = useRef(getInteraction(map, SelectGeometry.name));
    const isActive = active === SelectGeometry.name;

    interactionRef.current.setActive(isActive);

    if (!isActive) {
        interactionRef.current.getFeatures().clear();
    }

    function toggle() {
        onClick(!isActive ? SelectGeometry.name : null);
    }

    return (
        <button
            className={`${styles.select} ${active ? styles.active : ''}`}
            onClick={toggle}
            title='Velg geometri'
        >
            Velg geometri
        </button>
    );
}

SelectGeometry.addInteraction = (map) => {
    if (getInteraction(map, SelectGeometry.name) !== null) {
        return;
    }

    const layer = getLayer(map, 'feature');

    const interaction = new Select({
        layers: [layer],
        style: createEditStyle()
    });

    interaction.set('_name', SelectGeometry.name);
    interaction.setActive(false);

    map.addInteraction(interaction);
};
