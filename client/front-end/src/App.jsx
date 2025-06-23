import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setErrorMessage } from 'store/slices/appSlice';
import { resetProgress } from 'store/slices/datasetSlice';
import { useMap } from 'context/MapContext';
import { analyze } from 'utils/api';
import { createRandomId } from 'utils/helpers';
import { General, Form, ResultDialog, ResultList } from 'features';
import { Heading, ProgressBar, Toaster } from 'components';
import groupBy from 'lodash.groupby';
import useSocketIO from 'hooks/useSocketIO';
import messageHandlers from 'config/messageHandlers';
import styles from './App.module.scss';

export default function App() {
    useSocketIO(messageHandlers);
    const [data, setData] = useState(null);
    const [fetching, setFetching] = useState(false);
    const dispatch = useDispatch();
    const correlationId = useSelector(state => state.app.correlationId);
    const status = useSelector(state => state.dataset.status);
    const { clearCache } = useMap();

    function resetState() {
        setData(null);
        clearCache();
        dispatch(resetProgress());
    }

    async function start(payload) {
        resetState();

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
                <Form onSubmit={start} fetching={fetching} />
                {
                    fetching && (
                        <div className={styles.progress}>
                            <span className={styles.status}>{status}</span>
                            <ProgressBar />
                        </div>
                    )
                }
                {
                    data !== null && (
                        <>
                            <General
                                inputGeometryArea={data.inputGeometryArea}
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
