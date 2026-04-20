import { useEffect, useState } from 'react';
import DeleteGeometry from './DeleteGeometry';
import DrawPolygon from './DrawPolygon';
import DrawPolygonHole from './DrawPolygonHole';
import ModifyGeometry from './ModifyGeometry';
import SelectGeometry from './SelectGeometry';
import UndoRedo from './UndoRedo';
import styles from './Editor.module.scss';
import { getInteraction, writeGeometryObject } from 'utils/map/helpers';
import { interactionType, MAP_EPSG } from 'utils/map/constants';
import { useDispatch } from 'react-redux';
import { setUndoRedo } from 'store/slices/areaMapSlice';

export default function Editor({ map }) {
    const [active, setActive] = useState(null);
    const dispatch = useDispatch();

    useEffect(
        () => {
            if (map === null) {
                return;
            }

            const undoRedoInteraction = getInteraction(map, UndoRedo.name);
            undoRedoInteraction.clear();
        },
        [map]
    );


    const [editMode, setEditMode] = useState(false);

    function toggleEditMode() {
        setEditMode(!editMode);

        const undoRedoInteraction = getInteraction(map, interactionType.UndoRedo);
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

                        <ModifyGeometry
                            map={map}
                            active={active}
                            onClick={handleClick}
                        />

                        <UndoRedo map={map} />

                        <DeleteGeometry map={map} />
                    </>
                )
            }
        </div>
    );
}
