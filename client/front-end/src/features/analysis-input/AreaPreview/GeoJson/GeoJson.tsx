import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { json } from '@codemirror/lang-json';
import { EditorView } from '@codemirror/view';
import CodeMirror, { type BasicSetupOptions } from '@uiw/react-codemirror';
import { Button, Tooltip } from 'dibk-designsystemet';
import { CheckmarkIcon, FilesIcon } from '@navikt/aksel-icons';
import styles from './GeoJson.module.scss';

import type { CrsGeometry } from '@/types/geo.types';

const COPIED_DURATION_MS = 1500;

// Ligger utenfor komponenten fordi CodeMirror rekonfigureres hver gang extensions eller basicSetup får ny identitet
const extensions = [json(), EditorView.lineWrapping];

const basicSetup: BasicSetupOptions = {
    lineNumbers: true,
    foldGutter: true,
    highlightActiveLine: false,
    highlightActiveLineGutter: false,
};

interface GeoJsonProps {
    data: CrsGeometry | null;
}

// memo: AreaPreview rendres på nytt for hvert tastetrykk i bufferfeltet, og CodeMirror er dyr å rendre
export default memo(function GeoJson({ data }: GeoJsonProps) {
    const [copied, setCopied] = useState(false);
    const copiedTimeout = useRef<number | undefined>(undefined);

    // Store geometrier gir lange strenger, så de formateres bare når data endres
    const formatted = useMemo(
        () => (data !== null ? JSON.stringify(data, null, 4) : ''),
        [data],
    );

    useEffect(() => () => clearTimeout(copiedTimeout.current), []);

    async function copyText() {
        try {
            await navigator.clipboard.writeText(formatted);
        } catch (error) {
            console.log(error);
            return;
        }

        clearTimeout(copiedTimeout.current);
        setCopied(true);
        copiedTimeout.current = window.setTimeout(
            () => setCopied(false),
            COPIED_DURATION_MS,
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.copyButton}>
                <Tooltip
                    content="Kopier tekst"
                    data-size="sm"
                >
                    <Button
                        onClick={copyText}
                        variant="secondary"
                        icon
                    >
                        {!copied ? (
                            <FilesIcon
                                fontSize="24px"
                                aria-hidden
                            />
                        ) : (
                            <CheckmarkIcon
                                fontSize="24px"
                                aria-hidden
                            />
                        )}
                    </Button>
                </Tooltip>
            </div>

            {/* Innholdet i ds-tabpanel er slottet inn i en shadow root, og uten root
                legger CodeMirror stilene sine der i stedet for i document */}
            <CodeMirror
                root={document}
                value={formatted}
                extensions={extensions}
                editable={false}
                basicSetup={basicSetup}
                className={styles.editor}
            />
        </div>
    );
});
