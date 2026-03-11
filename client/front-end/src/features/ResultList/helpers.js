export function getResultClassNames(result, styles) {
    switch (result.resultStatus) {
        case 'NO-HIT-GREEN':
            return styles.noHitGreen;
        case 'NO-HIT-YELLOW':
            return styles.noHitYellow;
        case 'HIT-YELLOW':
            return styles.hitYellow;
        case 'HIT-RED':
            return styles.hitRed;
        case 'TIMEOUT':
            return styles.timeout;
        case 'ERROR':
            return styles.error;
        default:
            return '';
    }
}

export function getResultTitle(result) {
    const datasetTitle = result.runOnDataset ?
        `${result.runOnDataset.title}${result.title !== null ? `\r\n(${result.title})` : ''}` :
        result.title

    switch (result.resultStatus) {
        case 'TIMEOUT':
            return `Tidsavbrudd: ${datasetTitle}`;
        case 'ERROR':
            return `En feil har oppstått: ${datasetTitle}`;
        case 'NOT-IMPLEMENTED':
            return `Ikke implementert: ${datasetTitle}`;
        default:
            return datasetTitle;
    }
}

export function getDistance(result) {
    let distance = result.distanceToObject;

    if (distance >= 20_000) {
        distance = 20_000;
        return `> ${distance.toLocaleString('nb-NO')} m`
    }

    return `${distance.toLocaleString('nb-NO')} m`
}

export function getHitAreaPercent(result) {
    const percent = (result.hitArea / result.inputGeometryArea) * 100;
    const rounded = Math.round((percent + Number.EPSILON) * 100) / 100;

    return `${rounded.toLocaleString('nb-NO')} %`
}