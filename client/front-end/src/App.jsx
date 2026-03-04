import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setErrorMessage } from 'store/slices/appSlice';
import { resetState } from 'store/slices/analysisSlice';
import { useMap } from 'context/MapContext';
import { analyze } from 'utils/api';
import { createRandomId } from 'utils/helpers';
import { General, Form, ResultDialog, ResultList } from 'features';
import { Heading, Progress, Toaster } from 'components';
import groupBy from 'lodash.groupby';
import useSocketIO from 'hooks/useSocketIO';
import messageHandlers from 'config/messageHandlers';
import styles from './App.module.scss';
import { CheckmarkIcon } from '@navikt/aksel-icons';

export default function App() {
    useSocketIO(messageHandlers);
    const [data, setData] = useState(null);
    const [fetching, setFetching] = useState(false);
    const dispatch = useDispatch();
    const correlationId = useSelector(state => state.app.correlationId);
    const { clearCache } = useMap();

    function _resetState() {
        setData(null);
        clearCache();
        dispatch(resetState());
    }

    async function start(payload) {
        _resetState();

        try {
            setFetching(true);
            const response = await analyze(payload, correlationId);

            if (response?.code) {
                dispatch(setErrorMessage('Kunne ikke kjøre DOK-analyse. En feil har oppstått.'));
                console.log(response.code);
            } else {
                const { resultList } = response;
                resultList.forEach(result => result._tempId = createRandomId());

                const grouped = groupBy(resultList, result => result.resultStatus);

                setData({ ...response, resultList: grouped });
            }
        } catch (error) {
            dispatch(setErrorMessage('Kunne ikke kjøre DOK-analyse. En feil har oppstått.'));
            console.log(error);
        } finally {
            setFetching(false);
        }
    }

    return (
        <div className={styles.app}>
            <Heading />

            <div className={styles.content}>
                {/* <div className={styles.prog}>
                    <div>
                        <div className={styles.statusText}>
                            Starter opp
                        </div>
                        <div className={styles.progress}>
                            <CheckmarkIcon fontSize="24px" />
                        </div>
                    </div>
                    <div>
                        <div className={styles.statusText}>
                            Analyserer datasett 5 av 41
                        </div>
                        <div className={styles.progress}>41 %</div>
                    </div>
                </div> */}

                <Form onSubmit={start} fetching={fetching} />
                {
                    fetching && <Progress />
                }
                {
                    data !== null && (
                        <>
                            <General
                                inputGeometryArea={data.inputGeometryArea}
                                inputGeometry={data.inputGeometry}
                                municipalityNumber={data.municipalityNumber}
                                municipalityName={data.municipalityName}
                                rasterResult={data.factSheetRasterResult?.imageUri}
                                cartography={data.factSheetCartography}
                                factList={data.factList}
                                report={data.report}
                            />
                            <ResultList data={data} />
                            <ResultDialog inputGeometry={data.inputGeometry} />
                        </>
                    )
                }
                <Toaster />
            </div>
        </div>
    );
}
