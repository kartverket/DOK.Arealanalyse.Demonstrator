import { useEffect, useRef } from 'react';
import { getInteraction } from 'utils/map/interactions';
import { interactionType } from 'utils/map/constants';
import { Button } from '@digdir/designsystemet-react';
import ModifyPolgyonIcon from 'assets/gfx/icon-polygon-modify.svg?react';
import styles from '../Editor.module.scss';

export default function ModifyGeometry({ map, active, onClick }) {
    const interactionRef = useRef(getInteraction(map, interactionType.ModifyGeometry));
    const isActive = active === interactionType.ModifyGeometry;

    useEffect(
        () => {
            interactionRef.current.setActive(isActive);
        },
        [isActive]
    );

    function toggle() {
        onClick(!isActive ? interactionType.ModifyGeometry : null);
    }

    return (
        <Button
            icon
            onClick={toggle}
            title="Endre geometri"
            variant="tertiary"
            className={isActive ? styles.active : ''}
        >
            <ModifyPolgyonIcon 
                width="22" 
                height="22" 
                aria-hidden 
            />
        </Button>        
    );    
}
