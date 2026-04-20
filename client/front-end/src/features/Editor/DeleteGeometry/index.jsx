import { useSelector } from 'react-redux';
import { getInteraction, writeGeometryObject } from 'utils/map/helpers';
import { interactionType } from 'utils/map/constants';
import { Button } from '@digdir/designsystemet-react';
import { TrashIcon } from '@navikt/aksel-icons';

export default function DeleteGeometry({ map }) {
    const selectedGeometry = useSelector(state => state.areaMap.selectedGeometry);

    function deleteGeometry() {
        const selectInteraction = getInteraction(map, interactionType.SelectGeometry);

        if (selectInteraction === null) {
            return;
        }

        const feature = selectInteraction.getFeatures().item(0);

        if (feature === undefined) {
            return;
        }

        const undoRedoInteraction = getInteraction(map, interactionType.UndoRedo);

        if (undoRedoInteraction === null) {
            return;
        }

        undoRedoInteraction.push('replaceGeometry', {
            before: writeGeometryObject(feature.getGeometry()),
            after: null,
        });

        selectInteraction.getFeatures().clear();
        feature.setGeometry(null);
    }

    return (
        <Button
            icon
            onClick={deleteGeometry}
            title="Slett geometri"
            variant="tertiary"
            disabled={selectedGeometry === null}
        >
            <TrashIcon
                width="22"
                height="22"
                color="#000000"
                aria-hidden
            />
        </Button>
    );
}
