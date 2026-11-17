import { useState } from 'react';
import { api } from '@/lib/api/api';
import AreaEditor from '../AreaEditor/AreaEditor';
import SampleSelector from './SampleSelector/SampleSelector';
import Search from './Search/Search';
import { apiFetch } from '@/app/apiFetch';
import { setArea } from '@/app/appSlice';
import { useAppDispatch } from '@/app/hooks';
import { getFileTitle } from './AreaSelector.helpers';
import FilePicker from '@/components/FilePicker/FilePicker';
import { Button, Popover } from 'dibk-designsystemet';
import { PencilIcon, QuestionmarkCircleFillIcon } from '@navikt/aksel-icons';
import styles from './AreaSelector.module.scss';

import type { LonLat } from '@/types/geo.types';

const DEFAULT_EPSG = 25833;
const FILE_TYPES = ['json', 'geojson', 'sos', 'sosi', 'gml', 'gpkg'];

interface AreaSelectorProps {
    kommunenummer: string | null;
    currentLocation: LonLat | null;
}

export default function AreaSelector({
    kommunenummer,
    currentLocation,
}: AreaSelectorProps) {
    const [editorOpen, setEditorOpen] = useState(false);
    const dispatch = useAppDispatch();

    async function handleFileSelected(file: File | null) {
        if (file === null) {
            return;
        }

        try {
            const feature = await apiFetch(api.endpoints.getOmråde, {
                file,
                epsg: DEFAULT_EPSG,
            });
            if (feature !== null) {
                dispatch(
                    setArea({
                        geometry: feature.geometry,
                        title: getFileTitle(file, feature.properties),
                        source: { type: 'file' },
                    }),
                );
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className={styles.areaSelector}>
            <div>
                <Search kommunenummer={kommunenummer} />
            </div>

            <div className={styles.sampleSelector}>
                <SampleSelector />
            </div>

            <div className={styles.filePicker}>
                <FilePicker
                    label="Legg til fil"
                    fileTypes={FILE_TYPES}
                    onFileSelected={handleFileSelected}
                />

                <Button
                    icon
                    variant="tertiary"
                    popovertarget="fileTypes"
                    className={styles.popover}
                >
                    <QuestionmarkCircleFillIcon
                        fontSize="24px"
                        aria-hidden
                    />
                </Button>

                <Popover
                    id="fileTypes"
                    placement="top"
                >
                    GeoJSON, GML, SOSI, GeoPackage
                </Popover>
            </div>

            <div>
                <Button
                    variant="secondary"
                    onClick={() => setEditorOpen(true)}
                >
                    <PencilIcon aria-hidden />
                    Lag analyseområde
                </Button>

                <AreaEditor
                    open={editorOpen}
                    geometry={null}
                    currentLocation={currentLocation}
                    onClose={() => setEditorOpen(false)}
                />
            </div>
        </div>
    );
}
