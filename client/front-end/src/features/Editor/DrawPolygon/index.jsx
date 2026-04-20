import { useEffect, useRef } from 'react';
import { getInteraction } from 'utils/map/helpers';
import { interactionType } from 'utils/map/constants';
import { Button } from '@digdir/designsystemet-react';
import PolgyonIcon from 'assets/gfx/icon-polygon.svg?react';
import styles from '../Editor.module.scss';

export default function DrawPolygon({ map, active, onClick }) {
    const interactionRef = useRef(getInteraction(map, interactionType.DrawPolygon));
    const isActive = active === interactionType.DrawPolygon;

    useEffect(
        () => {
            interactionRef.current.setActive(isActive);
        },
        [isActive]
    );

    function toggle() {
        onClick(!isActive ? interactionType.DrawPolygon : null);
    }

    return (
        <Button
            icon
            onClick={toggle}
            title="Legg til polygon"
            variant="tertiary"
            className={isActive ? styles.active : ''}       
        >
            <PolgyonIcon 
                width="22" 
                height="22" 
                aria-hidden 
            />
        </Button>
    );
}
