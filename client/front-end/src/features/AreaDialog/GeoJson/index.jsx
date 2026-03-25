import { useMemo, useRef, useState } from 'react';
import { prettyPrintJson } from 'pretty-print-json';
import { getCrsName, getEpsgCode } from 'utils/helpers';
import { Button } from '@digdir/designsystemet-react';
import { CheckmarkIcon, FilesIcon } from '@navikt/aksel-icons';
import styles from './GeoJson.module.scss';

export default function GeoJson({ data }) {
    const json = useMemo(() => prettyPrintJson.toHtml(data, { quoteKeys: true, trailingCommas: false }), [data]);
    const [copied, setCopied] = useState(false);
    const outputRef = useRef(null);

    function renderCrs() {
        const epsg = getEpsgCode(getCrsName(data));
        const crs = epsg !== null ? `EPSG:${epsg}` : 'CRS84';

        return (
            <div className={styles.epsg}>
                <strong>CRS:</strong> {crs}
            </div>
        );
    }

    async function copyText() {
        await navigator.clipboard.writeText(outputRef.current.textContent)

        const timeout = setTimeout(() => {
            setCopied(false);
            clearTimeout(timeout);
        }, 1500);

        setCopied(true);
    }

    return (
        <div className={styles.geoJsonContainer}>
            <div className={styles.geoJsonWrapper}>
                <div className={styles.geoJson}>
                    <output ref={outputRef} dangerouslySetInnerHTML={{ __html: json }}></output>
                </div>

                <Button
                    icon
                    onClick={copyText}
                    variant="tertiary"
                    title="Kopiér"
                    aria-label="Kopiér"
                    className={styles.copyButton}
                >
                    {
                        !copied ?
                            <FilesIcon width="24px" height="24px" aria-hidden /> :
                            <CheckmarkIcon width="24px" height="24px" aria-hidden />
                    }
                </Button>
            </div>

            {renderCrs()}
        </div>
    );
}