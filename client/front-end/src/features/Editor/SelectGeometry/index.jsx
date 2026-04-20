import { useEffect, useRef } from 'react';
import { getInteraction } from 'utils/map/helpers';
import { interactionType } from 'utils/map/constants';
import { Button } from '@digdir/designsystemet-react';
import MouseArrowIcon from 'assets/gfx/icon-mouse-arrow.svg?react';
import styles from '../Editor.module.scss';

export default function SelectGeometry({ map, active, onClick }) {
    const interactionRef = useRef(getInteraction(map, interactionType.SelectGeometry));
    const isActive = active === interactionType.SelectGeometry;

    useEffect(
        () => {
            interactionRef.current.setActive(isActive);

            if (!isActive) {
                interactionRef.current.getFeatures().clear();
            }
        },
        [isActive]
    );

    function toggle() {
        onClick(!isActive ? interactionType.SelectGeometry : null);
    }

    return (
        <Button
            icon
            onClick={toggle}
            title="Velg geometri"
            variant="tertiary"
            className={isActive ? styles.active : ''}
        >
            <MouseArrowIcon
                width="16"
                height="16"
                color="#000000"
                aria-hidden
            />
        </Button>
    );
}
