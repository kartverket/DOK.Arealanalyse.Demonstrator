import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setErrorMessage } from 'store/slices/appSlice';
import { resetState } from 'store/slices/progressSlice';
import { useMap } from 'context/MapContext';
import { analyze } from 'utils/api';
import { General, Form, ResultDialog, ResultList, Result, Drawer } from 'features';
import { Heading, Progress, Toaster } from 'components';
import groupBy from 'lodash.groupby';
import useSocketIO from 'hooks/useSocketIO';
import messageHandlers from 'utils/messageHandlers';
import styles from './App.module.scss';
import { CheckmarkIcon } from '@navikt/aksel-icons';
import ResultHeader from 'features/ResultHeader';
import TableHeader from 'features/ResultTableHeader';
import ResultTable from 'features/ResultTable';
import ResultTableHeader from 'features/ResultTableHeader';

import { Button } from '@digdir/designsystemet-react';
import AnalysesProvider, { useAnalyses } from 'context/AnalysesContext';

export default function App() {
    useSocketIO(messageHandlers);
    const dispatch = useDispatch();
    // const { result, busy } = useAnalyses();

    const selectedResultId = useSelector(state => state.app.selectedResultId);

    // const selectedResult = useMemo(
    //     () => {
    //         return null;
    //     },
    //     [selectedResultId, data]
    // );

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

                <Form />
                {/* {
                    busy && <Progress />
                } */}
                <Result />
                <Drawer />
                <Toaster />
            </div>
        </div>
    );
}
