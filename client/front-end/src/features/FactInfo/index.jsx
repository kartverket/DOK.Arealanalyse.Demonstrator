import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFactInfo } from 'store/slices/appSlice';
import { Button, Heading } from '@digdir/designsystemet-react';
import { Dialog } from 'components';
import Map from './Map';
import styles from './FactInfo.module.scss';
import Area from './Area';
import Buildings from './Buildings';
import Roads from './Roads';
import General from './General';

const DATASET_ID = {
    AREA_TYPES: '166382b4-82d6-4ea9-a68e-6fd0c87bf788',
    BUILDINGS: '24d7e9d1-87f6-45a0-b38e-3447f8d7f9a1',
    ROADS: '900206a8-686f-4591-9394-327eb02d0899'
};

export default function FactInfo() {
    const data = useSelector(state => state.response.data);
    const { inputGeometry, requestedBuffer } = useSelector(state => state.app.formData);
    const factInfoOpen = useSelector(state => state.app.factInfoOpen);
    const dispatch = useDispatch();
    const contentRef = useRef(null);

    const { areaTypes, buildings, roads } = useMemo(
        () => {
            if (data === null) {
                return {
                    areaTypes: null,
                    buildings: null,
                    roads: null
                };
            }

            return {
                areaTypes: data.factList
                    .find(({ runOnDataset }) => runOnDataset.datasetId === DATASET_ID.AREA_TYPES),
                buildings: data.factList
                    .find(({ runOnDataset }) => runOnDataset.datasetId === DATASET_ID.BUILDINGS),
                roads: data.factList
                    .find(({ runOnDataset }) => runOnDataset.datasetId === DATASET_ID.ROADS)
            };
        },
        [data]
    );

    useEffect(
        () => {
            if (factInfoOpen) {
                contentRef.current.scrollTo(0, 0);
            }
        },
        [factInfoOpen]
    );

    function handleClose() {
        dispatch(toggleFactInfo(false));
    }

    function renderDialogContent() {
        return (
            <>
                <section>
                    <General
                        municipalityName={data.municipalityName}
                        municipalityNumber={data.municipalityNumber}
                        inputGeometryArea={data.inputGeometryArea}
                    />
                </section>

                <section className={styles.map}>
                    <Map
                        inputGeometry={inputGeometry}
                        buffer={requestedBuffer}
                        mapImageUri={data.factSheetRasterResult.imageUri}
                        cacheKey={data.id}
                    />
                </section>

                <section>
                    <Area factPart={areaTypes} />
                </section>

                <section>
                    <Buildings factPart={buildings} />
                </section>

                <section>
                    <Roads factPart={roads} />
                </section>
            </>
        );
    }

    return (
        <Dialog
            open={factInfoOpen}
            onClose={handleClose}
            className={styles.dialog}
        >
            {
                data !== null && (
                    <>
                        <Heading>Faktainformasjon</Heading>

                        <div className={styles.dialogContent}>
                            <div ref={contentRef}>
                                {renderDialogContent()}
                            </div>
                        </div>

                        <div className={styles.buttons}>
                            <Button onClick={handleClose}>Lukk</Button>
                        </div>
                    </>
                )
            }
        </Dialog>
    );
}