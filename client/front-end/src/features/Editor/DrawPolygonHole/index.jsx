import { useEffect, useRef } from 'react';
import { getInteraction } from 'utils/map/helpers';
import { interactionType } from 'utils/map/constants';
import { Button } from '@digdir/designsystemet-react';
import PolgyonHoleIcon from 'assets/gfx/icon-polygon-hole.svg?react';
import styles from '../Editor.module.scss';

export default function DrawPolygonHole({ map, active, onClick }) {
    const interactionRef = useRef(getInteraction(map, interactionType.DrawPolygonHole));
    const isActive = active === interactionType.DrawPolygonHole;

    useEffect(
        () => {
            interactionRef.current.setActive(isActive);
        },
        [isActive]
    );

    function toggle() {
        onClick(!isActive ? interactionType.DrawPolygonHole : null);
    }

    return (
        <Button
            icon
            onClick={toggle}
            title="Legg til hull"
            variant="tertiary"
            className={isActive ? styles.active : ''}
        >
            <PolgyonHoleIcon 
                width="22" 
                height="22" 
                aria-hidden 
            />
        </Button>        
    );
}
