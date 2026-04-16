import { getInteraction, writeGeometryObject } from 'utils/map/helpers';
import styles from '../Editor.module.scss';
import SelectGeometry from '../SelectGeometry';
import UndoRedo from '../UndoRedo';

export default function DeleteGeometry({ map }) {
    function _delete() {
        const selectInteraction = getInteraction(map, SelectGeometry.name);
        const feature = selectInteraction.getFeatures().item(0);

        if (feature === undefined) {
            return;
        }

        const undoRedoInteraction = getInteraction(map, UndoRedo.name);
        const geometry = writeGeometryObject(feature.getGeometry());
        console.log(geometry);
        selectInteraction.getFeatures().clear();

        feature.setGeometry(null);

        undoRedoInteraction.push('replaceGeometry', {
            before: geometry,
            after: null,
        });
    }

    return (
        <button
            className={styles.delete}
            onClick={_delete}
            title='Slett geometri'
        >Slett</button>
    );
}
