import { useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleFactInfo } from '@/app/appSlice';
import { Button, Heading } from '@digdir/designsystemet-react';
import Dialog from '@/components/Dialog/Dialog';
import Map from './Map/Map';
import styles from './FactInfo.module.scss';
import Area from './Area/Area';
import Buildings from './Buildings/Buildings';
import Roads from './Roads/Roads';
import General from './General/General';
import type { AreaTypesData, BuildingCount, FactPart, RoadLength } from '@/types/api.types';
import type { AnalysisData } from '@/types/analysis.types';

const DATASET_ID = {
    AREA_TYPES: '166382b4-82d6-4ea9-a68e-6fd0c87bf788',
    BUILDINGS: '24d7e9d1-87f6-45a0-b38e-3447f8d7f9a1',
    ROADS: '900206a8-686f-4591-9394-327eb02d0899'
};

export default function FactInfo() {
    const data = useAppSelector(state => state.response.data);
    const { inputGeometry, requestedBuffer } = useAppSelector(state => state.app.formData);
    const factInfoOpen = useAppSelector(state => state.app.factInfoOpen);
    const dispatch = useAppDispatch();
    const contentRef = useRef<HTMLDivElement>(null);

    const { areaTypes, buildings, roads } = useMemo(
        () => {
            if (data === null) {
                return {
                    areaTypes: undefined,
                    buildings: undefined,
                    roads: undefined
                };
            }

            return {
                areaTypes: data.factList
                    .find(({ runOnDataset }) => runOnDataset?.datasetId === DATASET_ID.AREA_TYPES) as FactPart<AreaTypesData> | undefined,
                buildings: data.factList
                    .find(({ runOnDataset }) => runOnDataset?.datasetId === DATASET_ID.BUILDINGS) as FactPart<BuildingCount[]> | undefined,
                roads: data.factList
                    .find(({ runOnDataset }) => runOnDataset?.datasetId === DATASET_ID.ROADS) as FactPart<RoadLength[]> | undefined
            };
        },
        [data]
    );

    useEffect(
        () => {
            if (factInfoOpen) {
                contentRef.current?.scrollTo(0, 0);
            }
        },
        [factInfoOpen]
    );

    function handleClose() {
        dispatch(toggleFactInfo(false));
    }

    function renderDialogContent(data: AnalysisData) {
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
                    {
                        inputGeometry !== null && (
                            <Map
                                inputGeometry={inputGeometry}
                                buffer={requestedBuffer}
                                mapImageUri={data.factSheetRasterResult.imageUri}
                                cacheKey={data.id}
                            />
                        )
                    }
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
                                {renderDialogContent(data)}
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