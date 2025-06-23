import { Paper } from '@mui/material';
import styles from './GeneralInfo.module.scss';

export default function GeneralInfo({ municipalityNumber, municipalityName, area }) {
    return (
        <Paper className={styles.generalInfo}>
            <div>
                <div>
                    <span className={styles.label}>Kommunenummer:</span>
                    <span>{municipalityNumber}</span>
                </div>
                <div>
                    <span className={styles.label}>Kommunenavn:</span>
                    <span>{municipalityName}</span>
                </div>
                <div>
                    <span className={styles.label}>Områdeareal:</span>
                    <span>{Math.round(area).toLocaleString('nb-NO')} m²</span>
                </div>
            </div>
        </Paper>
    );
}
