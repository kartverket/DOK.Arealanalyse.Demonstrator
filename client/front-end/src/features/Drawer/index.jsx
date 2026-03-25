import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedResultId } from 'store/slices/responseSlice';
import { motionProps } from './helpers';
import RcDrawer from 'rc-drawer';
import { AnimatePresence, motion } from 'framer-motion';
import { Result } from 'features';
import { Button } from '@digdir/designsystemet-react';
import { ArrowDownIcon, ArrowUpIcon, ChevronRightDoubleIcon } from '@navikt/aksel-icons';
import styles from './Drawer.module.scss';

const Key = {
    ARROW_DOWN: 'ArrowDown',
    ARROW_UP: 'ArrowUp',
    ESCAPE: 'Escape'
};

export default function Drawer() {    
    const selectedResultId = useSelector(state => state.response.selectedResultId);
    const selectedResult = useSelector(state => state.response.results.byId[selectedResultId]);    
    const filteredResultIds = useSelector(state => state.response.filteredResultIds);
    const data = useSelector(state => state.response.data);
    const selectedResultIdRef = useRef(null);
    const drawerRef = useRef(null);
    const dispatch = useDispatch();
    
    useEffect(
        () => {
            selectedResultIdRef.current = selectedResultId;
        },
        [selectedResultId]
    );

    const goPrevious = useCallback(
        () => {
            const index = filteredResultIds.indexOf(selectedResultIdRef.current);
            let prevId;

            if (index === 0) {
                prevId = filteredResultIds[filteredResultIds.length - 1];
            } else {
                prevId = filteredResultIds[index - 1];
            }

            dispatch(setSelectedResultId(prevId));
        },
        [dispatch, filteredResultIds]
    );

    const goNext = useCallback(
        () => {
            const index = filteredResultIds.indexOf(selectedResultIdRef.current);
            let nextId;

            if (index + 1 === filteredResultIds.length) {
                nextId = filteredResultIds[0];
            } else {
                nextId = filteredResultIds[index + 1];
            }

            dispatch(setSelectedResultId(nextId));
        },
        [dispatch, filteredResultIds]
    );

    const close = useCallback(
        () => {
            dispatch(setSelectedResultId(null));
        },
        [dispatch]
    );

    const handleKeyDown = useCallback(
        event => {
            const key = event.key;

            if (![Key.ARROW_UP, Key.ARROW_DOWN, Key.ESCAPE].includes(key)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            if (key === Key.ARROW_UP) {
                goPrevious();
            } else if (key === Key.ARROW_DOWN) {
                goNext();
            } else if (key === Key.ESCAPE) {
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

    function scrollToTop() {
        drawerRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    return (
        <RcDrawer
            open={selectedResult !== undefined}
            placement="right"
            width="50%"
            afterOpenChange={handleOpenChange}
            panelRef={drawerRef}
            {...motionProps}
        >
            {
                selectedResult !== undefined && (
                    <div className={styles.drawer}>
                        <div className={styles.top}>
                            <div className={styles.navigation}>
                                <Button
                                    onClick={close}
                                    icon
                                    variant="secondary"
                                    title="Lukk"
                                    aria-label="Lukk"
                                >
                                    <ChevronRightDoubleIcon aria-hidden />
                                </Button>

                                <span className={styles.divider}></span>

                                <Button
                                    onClick={goPrevious}
                                    icon
                                    variant="secondary"
                                    title="Forrige"
                                    aria-label="Forrige"
                                >
                                    <ArrowUpIcon aria-hidden />
                                </Button>

                                <Button
                                    onClick={goNext}
                                    icon
                                    variant="secondary"
                                    title="Neste"
                                    aria-label="Neste"
                                >
                                    <ArrowDownIcon aria-hidden />
                                </Button>
                            </div>

                            <div className={styles.hits}>
                                {filteredResultIds.indexOf(selectedResultId) + 1} av {filteredResultIds.length} treff
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
                                    inputGeometry={data.inputGeometry}
                                />
                            </motion.div>
                        </AnimatePresence>

                        <div className={styles.bottom}>
                            <Button
                                onClick={scrollToTop}
                                variant="secondary"
                                aria-label="Til toppen"
                            >
                                <ArrowUpIcon aria-hidden />
                                Til toppen
                            </Button>
                        </div>
                    </div>
                )
            }
        </RcDrawer>
    );
}