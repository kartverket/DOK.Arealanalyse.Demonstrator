import Editor from './Editor/Editor';
import Dialog from '@/components/Dialog/Dialog';
import { Heading } from 'dibk-designsystemet';
import styles from './AreaEditor.module.scss';

import type { CrsGeometry, LonLat } from '@/types/geo.types';

interface AreaEditorProps {
    open: boolean;

    // null når et nytt område skal tegnes
    geometry: CrsGeometry | null;
    currentLocation: LonLat | null;
    onClose: () => void;
}

export default function AreaEditor({
    open,
    geometry,
    currentLocation,
    onClose,
}: AreaEditorProps) {
    const heading =
        geometry !== null ? 'Rediger analyseområde' : 'Lag analyseområde';

    return (
        <Dialog
            open={open}
            closeButton={false}
            className={styles.areaEditor}
            aria-label={heading}
        >
            {/* Kartet lages bare mens dialogen er åpen, og redigeringen starter på nytt hver gang */}
            {open && (
                <div className={styles.content}>
                    <Heading
                        level={2}
                        data-size="xs"
                    >
                        {heading}
                    </Heading>

                    <Editor
                        geometry={geometry}
                        currentLocation={currentLocation}
                        onClose={onClose}
                    />
                </div>
            )}
        </Dialog>
    );
}
