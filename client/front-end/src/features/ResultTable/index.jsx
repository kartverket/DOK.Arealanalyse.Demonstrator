import { useDispatch } from 'react-redux';
import { Table } from '@digdir/designsystemet-react';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react';
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react';
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react';
import styles from './ResultTable.module.scss';
import { setSelectedResultId } from 'store/slices/appSlice';

export default function ResultTable({ result }) {
    const dispatch = useDispatch();

    function getHitAreaOrDistance(resultItem) {
        if (resultItem.hitArea.formatted !== null) {
            return resultItem.hitArea.formatted;
        } else if (resultItem.distance.formatted !== null) {
            return resultItem.distance.formatted;
        }

        return null;
    }

    function renderStatusIcon(status) {
        switch (status) {
            case 'HIT-RED':
                return (
                    <span className={styles.mustHandle}>
                        <MustHandleIcon />
                    </span>
                );
            case 'HIT-YELLOW':
            case 'NO-HIT-YELLOW':
            case 'NOT-IMPLEMENTED':
            case 'TIMEOUT':
            case 'ERROR':
                return (
                    <span className={styles.mustCheck}>
                        <MustCheckIcon />
                    </span>
                );
            case 'NO-HIT-GREEN':

                return (
                    <span className={styles.nearby}>
                        <NearbyIcon />
                    </span>
                );
            case 'NOT-RELEVANT':
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
        <div className={styles.tableContainer}>
            <div>
                <Table className={styles.resultTable}>
                    <Table.Head>
                        <Table.Row>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Tema</Table.HeaderCell>
                            <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
                            <Table.HeaderCell></Table.HeaderCell>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {
                            result.map(resultItem => (
                                <Table.Row key={resultItem._id} onClick={() => handleRowClick(resultItem._id)}>
                                    <Table.Cell className={styles.status}>
                                        {renderStatusIcon(resultItem.status)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className={styles.themes}>
                                            {
                                                resultItem.themes.map(theme => (
                                                    <span key={theme} className={styles.theme}>{theme}</span>
                                                ))
                                            }
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell className={styles.description}>{resultItem.description}</Table.Cell>
                                    <Table.Cell className={styles.hitAreaOrDistance}>{getHitAreaOrDistance(resultItem)}</Table.Cell>
                                </Table.Row>
                            ))
                        }
                    </Table.Body>
                </Table>
            </div>
        </div>
    );
}