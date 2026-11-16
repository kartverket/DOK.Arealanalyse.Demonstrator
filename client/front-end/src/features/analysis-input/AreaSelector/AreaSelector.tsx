import { api } from '@/lib/api/api';
import SampleSelector from './SampleSelector/SampleSelector';
import Search from './Search/Search';
import { apiFetch } from '@/app/apiFetch';
import { setArea } from '@/app/appSlice';
import { useAppDispatch } from '@/app/hooks';
import { getFileTitle } from './AreaSelector.helpers';
import FilePicker from '@/components/FilePicker/FilePicker';
import { Button, Popover } from 'dibk-designsystemet';
import { QuestionmarkCircleFillIcon } from '@navikt/aksel-icons';
import styles from './AreaSelector.module.scss';

const DEFAULT_EPSG = 25833;
const FILE_TYPES = ['json', 'geojson', 'sos', 'sosi', 'gml', 'gpkg'];

interface AreaSelectorProps {
    kommunenummer: string | null;
}

export default function AreaSelector({ kommunenummer }: AreaSelectorProps) {
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
        </div>
    );
}
