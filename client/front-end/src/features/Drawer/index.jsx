import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useResponse } from 'context';
import { setSelectedResultId } from 'store/slices/appSlice';
import { getResult, motionProps } from './helpers';
import { Result } from 'features';
import RcDrawer from 'rc-drawer';
import { Button } from '@digdir/designsystemet-react';
import { ArrowDownIcon, ArrowUpIcon, ChevronRightDoubleIcon } from '@navikt/aksel-icons';
import styles from './Drawer.module.scss';
import { AnimatePresence, motion } from 'framer-motion';

const KEY = {
    ARROW_DOWN: 'ArrowDown',
    ARROW_UP: 'ArrowUp',
    ESCAPE: 'Escape'
};

export default function Drawer() {
    const { response } = useResponse();
    const selectedResultId = useSelector(state => state.app.selectedResultId);
    const resultIds = useSelector(state => state.app.filteredResultIds);
    const selectedResultIdRef = useRef(0);
    const dispatch = useDispatch();

    useEffect(
        () => {
            selectedResultIdRef.current = selectedResultId;
        },
        [selectedResultId]
    );

    const selectedResult = useMemo(
        () => {
            if (response === null || selectedResultId === 0) {
                return null;
            }

            return getResult(response.resultList, selectedResultId);
        },
        [response, selectedResultId]
    );

    const goPrevious = useCallback(
        () => {
            const index = resultIds.indexOf(selectedResultIdRef.current);
            let prevId;

            if (index === 0) {
                prevId = resultIds[resultIds.length - 1];
            } else {
                prevId = resultIds[index - 1];
            }

            dispatch(setSelectedResultId(prevId));
        },
        [dispatch, resultIds]
    );

    const goNext = useCallback(
        () => {
            const index = resultIds.indexOf(selectedResultIdRef.current);
            let nextId;

            if (index + 1 === resultIds.length) {
                nextId = resultIds[0];
            } else {
                nextId = resultIds[index + 1];
            }

            dispatch(setSelectedResultId(nextId));
        },
        [dispatch, resultIds]
    );

    const close = useCallback(
        () => {
            dispatch(setSelectedResultId(0));
        },
        [dispatch]
    );

    const handleKeyDown = useCallback(
        event => {
            const key = event.key;

            if (![KEY.ARROW_UP, KEY.ARROW_DOWN, KEY.ESCAPE].includes(key)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            if (key === KEY.ARROW_UP) {
                goPrevious();
            } else if (key === KEY.ARROW_DOWN) {
                goNext();
            } else if (key === KEY.ESCAPE) {
                close();
            }
        },
        [goPrevious, goNext, close]
    );

    const handleOpenChange = useCallback(
        open => {
            if (open) {
                document.addEventListener('keydown', handleKeyDown);
            } else {
                document.removeEventListener('keydown', handleKeyDown);
            }
        },
        [handleKeyDown]
    );

    return (
        <RcDrawer
            open={selectedResult !== null}
            placement="right"
            width="50%"
            afterOpenChange={handleOpenChange}
            {...motionProps}
        >
            {
                selectedResult !== null && (
                    <div className={styles.drawer}>
                        <div className={styles.top}>
                            <div className={styles.navigation}>
                                <Button
                                    onClick={close}
                                    icon
                                    variant="secondary"
                                    aria-label="Lukk"
                                >
                                    <ChevronRightDoubleIcon aria-hidden />
                                </Button>

                                <span className={styles.divider}></span>

                                <Button
                                    onClick={goPrevious}
                                    icon
                                    variant="secondary"
                                    aria-label="Forrige"
                                >
                                    <ArrowUpIcon aria-hidden />
                                </Button>

                                <Button
                                    onClick={goNext}
                                    icon
                                    variant="secondary"
                                    aria-label="Neste"
                                >
                                    <ArrowDownIcon aria-hidden />
                                </Button>
                            </div>

                            <div className={styles.hits}>
                                {resultIds.indexOf(selectedResultId) + 1} av {resultIds.length} treff
                            </div>
                        </div>
                        
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={selectedResult.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Result
                                    result={selectedResult}
                                    inputGeometry={response.inputGeometry}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )
            }
        </RcDrawer>
    );
}