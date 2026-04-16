import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
// import { GeometryType } from 'context/MapProvider/helpers/constants';
import { createModifyGeometryStyle, GeometryType } from '../helpers';
import ModifyFeature from 'ol-ext/interaction/ModifyFeature';
import styles from '../Editor.module.scss';
import { getLayer } from 'utils/map';
import { getFeaturesLayer, getInteraction } from 'utils/map/helpers';

export default function ModifyGeometry({ map, active, onClick }) {
    const interactionRef = useRef(getInteraction(map, ModifyGeometry.name));
    const [_active, setActive] = useState(false);
    // const featuresSelected = useSelector(
    //     (state) => state.map.editor.featuresSelected
    // );
    const geomType = GeometryType.Polygon // useSelector((state) => state.geomEditor.geomType);

    useEffect(() => {
        interactionRef.current.setActive(active === ModifyGeometry.name);
        setActive(active === ModifyGeometry.name);
    }, [active]);

    function toggle() {
        onClick(!_active ? ModifyGeometry.name : null);
    }

    return (
        <button
            className={`${geomType === GeometryType.Polygon
                    ? styles.modifyPolygon
                    : styles.modifyLineString
                } ${_active ? styles.active : ''}`}
            onClick={toggle}
            title='Endre geometri'
            // disabled={featuresSelected}
        >
            Endre geometri
        </button>
    );
}

ModifyGeometry.addInteraction = (map) => {
    if (getInteraction(map, ModifyGeometry.name) !== null) {
        return;
    }

    const vectorLayer = getFeaturesLayer(map);

    // const vectorLayer = getEditLayer(map);
    // if (!vectorLayer) return;
    // const source = getVectorSource(vectorLayer);

    const interaction = new ModifyFeature({
        source: vectorLayer.getSource(),
        style: createModifyGeometryStyle(),
    });

    interaction.set('_name', ModifyGeometry.name);
    interaction.setActive(false);

    map.addInteraction(interaction);
};
