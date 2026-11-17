import { Tooltip } from 'dibk-designsystemet';
import { MinusIcon, PlusIcon } from '@navikt/aksel-icons';
import styles from './Zoom.module.scss';

import type OlMap from 'ol/Map';

interface ZoomProps {
    map: OlMap;
    className?: string;
}

export default function Zoom({ map, className = '' }: ZoomProps) {
    function zoomIn() {
        const view = map.getView();
        const maxZoom = view.getMaxZoom();
        let zoom = view.getZoom()! + 1;
        if (zoom > maxZoom) {
            zoom = maxZoom;
        }

        view.animate({
            zoom,
            duration: 250,
        });
    }

    function zoomOut() {
        const view = map.getView();
        const minZoom = view.getMinZoom();
        let zoom = view.getZoom()! - 1;
        if (zoom < minZoom) {
            zoom = minZoom;
        }

        view.animate({
            zoom,
            duration: 250,
        });
    }

    return (
        <div className={`${styles.zoomControl} ${className}`}>
            <Tooltip
                content="Zoom inn"
                placement="right"
            >
                <button
                    className={styles.zoomIn}
                    onClick={zoomIn}
                >
                    <PlusIcon aria-hidden />
                </button>
            </Tooltip>

            <Tooltip
                content="Zoom ut"
                placement="right"
            >
                <button
                    className={styles.zoomOut}
                    onClick={zoomOut}
                >
                    <MinusIcon aria-hidden />
                </button>
            </Tooltip>
        </div>
    );
}
