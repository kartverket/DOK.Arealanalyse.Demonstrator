import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Result, Drawer } from 'features';
import { Heading, Toaster } from 'components';
import useSocketIO from 'hooks/useSocketIO';
import messageHandlers from 'utils/messageHandlers';
import styles from './App.module.scss';

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
                <Form />
                <Result />
                <Drawer />
                <Toaster />
            </div>
        </div>
    );
}
