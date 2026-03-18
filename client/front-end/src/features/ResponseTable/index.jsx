import { useDispatch } from 'react-redux';
import { useAnalyses } from 'context';
import { setSelectedResultId } from 'store/slices/appSlice';
import { RESULT_STATUS } from 'utils/constants';
import { Table } from '@digdir/designsystemet-react';
import { Progress } from 'features';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react';
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react';
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react';
import styles from './ResponseTable.module.scss';
import { ChevronRightIcon } from '@navikt/aksel-icons';

export default function ResponseTable({ resultList }) {   
    const dispatch = useDispatch();
    const { busy } = useAnalyses();

    function getHitAreaOrDistance(result) {
        if (result.hitArea.formatted !== null) {
            return result.hitArea.formatted;
        } else if (result.distance.formatted !== null) {
            return result.distance.formatted;
        }

        return null;
    }

    function renderStatusIcon(status) {
        switch (status) {
            case RESULT_STATUS.HIT_RED:
                return (
                    <span className={styles.mustHandle}>
                        <MustHandleIcon />
                    </span>
                );
            case RESULT_STATUS.HIT_YELLOW:
            case RESULT_STATUS.NO_HIT_YELLOW:
            case RESULT_STATUS.NOT_IMPLEMENTED:
            case RESULT_STATUS.TIMEOUT:
            case RESULT_STATUS.ERROR:
                return (
                    <span className={styles.mustCheck}>
                        <MustCheckIcon />
                    </span>
                );
            case RESULT_STATUS.NO_HIT_GREEN:
                return (
                    <span className={styles.nearby}>
                        <NearbyIcon />
                    </span>
                );
            case RESULT_STATUS.NOT_RELEVANT:
                return (
                    <span className={styles.notAnalyzed}>
                        <NotAnalyzedIcon />
                    </span>
                );
            default:
                return null;
        }
    }

    function handleRowClick(id) {
        dispatch(setSelectedResultId(id));
    }

    return (
        !busy ?
            <div className={styles.tableContainer}>
                <div>
                    <Table className={styles.responseTable}>
                        <Table.Head>
                            <Table.Row>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell>Tema</Table.HeaderCell>
                                <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
                                <Table.HeaderCell></Table.HeaderCell>
                                <Table.HeaderCell></Table.HeaderCell>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            {
                                resultList.map(result => (
                                    <Table.Row key={result.id} onClick={() => handleRowClick(result.id)}>
                                        <Table.Cell className={styles.status}>
                                            {renderStatusIcon(result.status)}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className={styles.themes}>
                                                {
                                                    result.themes.map(theme => (
                                                        <span key={theme} className={styles.theme}>{theme}</span>
                                                    ))
                                                }
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell className={styles.description}>{result.description}</Table.Cell>
                                        <Table.Cell className={styles.hitAreaOrDistance}>{getHitAreaOrDistance(result)}</Table.Cell>
                                        <Table.Cell>
                                            <ChevronRightIcon fontSize="24px" color="#d1d5dc" />
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            }
                        </Table.Body>
                    </Table>
                </div>
            </div> :
            <Progress />
    );
}