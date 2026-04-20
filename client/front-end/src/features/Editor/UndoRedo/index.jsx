import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { getInteraction } from 'utils/map/helpers';
import { interactionType } from 'utils/map/constants';
import { Button } from '@digdir/designsystemet-react';
import { ArrowRedoIcon, ArrowUndoIcon } from '@navikt/aksel-icons';

export default function UndoRedo({ map }) {
    const interactionRef = useRef(getInteraction(map, interactionType.UndoRedo));
    const undoRedo = useSelector(state => state.areaMap.undoRedo);

    function undo() {
        interactionRef.current.undo();
    }

    function redo() {
        interactionRef.current.redo();
    }

    return (
        <>
            <Button
                icon
                onClick={undo}
                title="Angre"
                variant="tertiary"
                disabled={!undoRedo.hasUndo}
            >
                <ArrowUndoIcon
                    width="22"
                    height="22"
                    color="#000000"
                    aria-hidden
                />
            </Button>

            <Button
                icon
                onClick={redo}
                title="Gjør om"
                variant="tertiary"
                disabled={!undoRedo.hasRedo}                
            >
                <ArrowRedoIcon
                    width="22"
                    height="22"
                    color="#000000"
                    aria-hidden
                />
            </Button>
        </>
    );
}
