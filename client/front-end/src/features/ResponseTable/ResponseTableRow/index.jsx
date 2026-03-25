import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedResultId, setMapDialogOpen } from 'store/slices/responseSlice';
import { ResultStatus } from 'utils/constants';
import { Table } from '@digdir/designsystemet-react';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react';
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react';
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react';
import { ChevronRightIcon } from '@navikt/aksel-icons';
import styles from '../ResponseTable.module.scss';

function ResponseTableRow({ result }) {
    const selectedResultId = useSelector(state => state.response.selectedResultId);
    const dispatch = useDispatch();

    function getRowClassName(result) {
        const classes = [];

        if (result.id === selectedResultId) {
            classes.push(styles.selected);
        }

        switch (result.status) {
            case ResultStatus.HIT_RED:
                classes.push(styles.mustHandle);
                break;
            case ResultStatus.HIT_YELLOW:
            case ResultStatus.NO_HIT_YELLOW:
            case ResultStatus.NOT_IMPLEMENTED:
            case ResultStatus.TIMEOUT:
            case ResultStatus.ERROR:
                classes.push(styles.mustCheck);
                break;
            case ResultStatus.NO_HIT_GREEN:
                classes.push(styles.nearby);
                break;
            case ResultStatus.NOT_RELEVANT:
                classes.push(styles.notAnalyzed);
                break;
            default:
                break;
        }

        return classes.join(' ');
    }

    function renderStatusIcon(status) {
        switch (status) {
            case ResultStatus.HIT_RED:
                return <MustHandleIcon />;
            case ResultStatus.HIT_YELLOW:
            case ResultStatus.NO_HIT_YELLOW:
            case ResultStatus.NOT_IMPLEMENTED:
            case ResultStatus.TIMEOUT:
            case ResultStatus.ERROR:
                return <MustCheckIcon />;
            case ResultStatus.NO_HIT_GREEN:
                return <NearbyIcon />;
            case ResultStatus.NOT_RELEVANT:
                return <NotAnalyzedIcon />;
            default:
                return null;
        }
    }

    function renderDescription(result) {
        return (
            <div className={styles.description}>
                {
                    result.title !== null ?
                        <>
                            <span className={styles.datasetTitle}>{result.datasetTitle}</span>
                            <span className={styles.title}>{result.title}</span>
                        </> :
                        <span className={styles.title}>{result.datasetTitle}</span>
                }
            </div>
        );
    }

    function getHitAreaOrDistance(result) {
        if (result.hitArea.formatted !== null) {
            return result.hitArea.formatted;
        } else if (result.distance.formatted !== null) {
            return result.distance.formatted;
        }

        return null;
    }

    function handleRowClick(id) {
        dispatch(setSelectedResultId(id));
    }

    return (
        <Table.Row
            onClick={() => handleRowClick(result.id)}
            className={getRowClassName(result)}
        >
            <Table.Cell>
                <span className={styles.status}>
                    {renderStatusIcon(result.status)}
                </span>
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
            <Table.Cell>{renderDescription(result)}</Table.Cell>
            <Table.Cell className={styles.hitAreaOrDistance}>{getHitAreaOrDistance(result)}</Table.Cell>
            <Table.Cell>
                <ChevronRightIcon fontSize="24px" color="#d1d5dc" />
            </Table.Cell>
        </Table.Row>
    );
}

export default memo(ResponseTableRow);