import styles from './General.module.scss';

export default function General({ municipalityName, municipalityNumber, inputGeometryArea }) {
    return (
        <div className={styles.general}>
            <div>
                <div>
                    <span className={styles.label}>Kommunenavn:</span>
                    <span>{municipalityName}</span>
                </div>
                <div>
                    <span className={styles.label}>Kommunenummer:</span>
                    <span>{municipalityNumber}</span>
                </div>
                <div>
                    <span className={styles.label}>Områdeareal:</span>
                    <span>{Math.round(inputGeometryArea).toLocaleString('nb-NO')} m²</span>
                </div>
            </div>
        </div>
    )
}