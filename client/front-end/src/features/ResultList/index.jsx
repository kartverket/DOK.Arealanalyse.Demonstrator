import { useDispatch } from 'react-redux';
import { inPlaceSort } from 'fast-sort';
import { setSelectedResult } from 'store/slices/appSlice';
import { getDistance, getHitAreaPercent, getResultClassNames, getResultTitle } from './helpers';
import { Tooltip, Paper } from '@mui/material';
import styles from './ResultList.module.scss';

export default function ResultList({ data }) {
    const dispatch = useDispatch();

    function selectResult(result) {
        dispatch(setSelectedResult(result));
    }

    function getResultRowClassName(result) {
        const classNames = [styles.resultRow];

        if (result.qualityWarning.length > 0) {
            classNames.push(styles.hasWarnings);
        }

        switch (result.resultStatus) {
            case 'NO-HIT-YELLOW':
                classNames.push(styles.warning);
                break;
            case 'TIMEOUT':
            case 'ERROR':
                classNames.push(styles.hasFailed)
                break;
            default:
                break;
        }

        return classNames.join(' ');
    }

    function getDokRegisterLink() {
        return `https://register.geonorge.no/det-offentlige-kartgrunnlaget-kommunalt?municipality=${data.municipalityNumber}`;
    }

    function renderThemeName(result) {
        return (
            <strong className={`${styles.themeName} ${getResultClassNames(result, styles)}`}>
                <span>{result.themes[0]}</span>
            </strong>
        );
    }

    function renderTitle(result) {
        return (
            <span className={styles.title}>{getResultTitle(result)}</span>
        );
    }

    function renderWarnings(result) {
        if (!result.qualityWarning.length) {
            return null;
        }

        return (
            <div className={styles.warnings}>
                <ul>
                    {result.qualityWarning.map(warning => <li key={warning}>{warning}</li>)}
                </ul>
            </div>
        );
    }

    function renderHitAreaAndDistance(result) {
        if (result.hitArea !== null && result.hitArea !== 0) {
            return (
                <Tooltip
                    title={
                        <span className={styles.tooltip}>Andel av analyseområde med evt. buffer som treffer datasettets område</span>
                    }
                    placement="top-end"
                >
                    <span>Treff: <strong>{getHitAreaPercent(result)}</strong></span>
                </Tooltip>
            );
        } else if (result.distanceToObject !== 0) {
            return (
                <Tooltip
                    title={
                        <span className={styles.tooltip}>Angir antall meter fra utkant av analyseområde til nærmeste objekt i datasett</span>
                    }
                    placement="top-end"
                >
                    <span>Avstand: <strong>{getDistance(result)}</strong></span>
                </Tooltip>
            );
        }

        return null;
    }

    function renderResults(resultStatus) {
        const resultList = data.resultList[resultStatus];

        if (resultList === undefined) {
            return null;
        }

        if (resultStatus === 'HIT-RED' || resultStatus === 'HIT-YELLOW') {
            inPlaceSort(resultList).desc([
                result => result.hitArea || 0,
                result => result.themes[0]
            ]);
        }

        if (resultStatus === 'NO-HIT-GREEN') {
            inPlaceSort(resultList).asc([
                result => result.distanceToObject,
                result => result.themes[0]
            ]);
        }

        return (
            <div className={styles.resultGroup}>
                <Paper sx={{ marginBottom: '18px' }}>
                    {
                        resultList.map((result, index) => (
                            <div key={index} className={getResultRowClassName(result)} onClick={() => selectResult(result)}>
                                {renderThemeName(result)}
                                {renderTitle(result)}
                                {renderWarnings(result)}

                                <div className={styles.hitAndDistance}>
                                    {renderHitAreaAndDistance(result)}
                                </div>
                            </div>
                        ))
                    }
                </Paper>
            </div>
        );
    }

    function renderErrorResults(resultStatus) {
        const resultList = data.resultList[resultStatus];

        if (resultList === undefined) {
            return null;
        }

        return (
            <div className={styles.resultGroup}>
                <Paper sx={{ marginBottom: '18px' }}>
                    {
                        resultList.map((result, index) => (
                            <div key={index} className={getResultRowClassName(result)}>
                                {renderThemeName(result)}
                                {renderTitle(result)}
                            </div>
                        ))
                    }
                </Paper>
            </div>
        );
    }


    function renderNotRelevant() {
        const resultList = data.resultList['NOT-RELEVANT'] || [];

        if (resultList.length === 0) {
            return null;
        }

        inPlaceSort(resultList).asc(result => result.runOnDataset.title);
        const distinct = new Set(resultList.map(result => result.runOnDataset?.title || result.title));

        return (
            <Paper className={styles.notRelevant}>
                <span className={styles.heading}>
                    {data.municipalityName} kommune har i <a href={getDokRegisterLink()} target="_blank" rel="noopener noreferrer">Det offentlige kartgrunnlaget</a> valgt bort følgende datasett:
                </span>
                <ul>
                    {[...distinct].map(title => <li key={title}>{title}</li>)}
                </ul>
            </Paper>
        );
    }

    return (
        <div className={styles.container}>
            <div>
                {renderResults('HIT-RED')}
                {renderResults('HIT-YELLOW')}
                {renderResults('NO-HIT-YELLOW')}
                {renderResults('NO-HIT-GREEN')}
                {renderErrorResults('TIMEOUT')}
                {renderErrorResults('ERROR')}
            </div>

            {renderNotRelevant()}
        </div>
    );
}