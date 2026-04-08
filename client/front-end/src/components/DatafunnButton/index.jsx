import bbox from '@turf/bbox';
import { getCrsName, getEpsgCode } from 'utils/helpers';
import { Button, Tooltip } from '@digdir/designsystemet-react';
import DatafunnIcon from 'assets/gfx/icon-datafunn.svg?react';
import styles from './DatafunnButton.module.scss';

const DATAFUNN_URL = import.meta.env.VITE_DATAFUNN_URL;
const SYSTEM_NAME = 'DOK Arealanalyse - Demonstrator';

export default function DatafunnButton({ inputGeometry, className = '' }) {
    function getDatafunnUrl() {
        const extent = bbox(inputGeometry);
        const crsName = getCrsName(inputGeometry);
        const epsgCode = getEpsgCode(crsName);

        let queryString = `?extent=${extent.join(',')}`;

        if (epsgCode !== null) {
            queryString += `&epsg=${epsgCode}`;
        }

        queryString += `&system=${encodeURIComponent(SYSTEM_NAME)}`;

        return `${DATAFUNN_URL}/${queryString}`
    }

    if (inputGeometry === null) {
        return null;
    }

    return (
        <div className={className}>
            <Tooltip
                content="Meld inn feil eller mangler i temadata til en førstelinjebehandling i en konseptutprøving for Geolett 2 - Datafunn"
            >
                <Button
                    variant="primary"
                    data-size="sm"
                    className={styles.button}
                    asChild
                >                    
                    <a
                        href={getDatafunnUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <DatafunnIcon width="20" height="20" aria-hidden />
                        Meld feil i kartet
                    </a>
                </Button>
            </Tooltip>
        </div>
    );
}
