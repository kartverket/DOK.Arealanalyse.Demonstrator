import { Alert } from '@mui/material';
import styles from '../Result.module.scss';

export default function GuidanceText({ result }) {
    function renderGuidanceText() {
        const status = result.resultStatus;

        if (status === 'NO-HIT-GREEN') {
            return <Alert icon={false} severity="success">Ingen tiltak trenger å utføres</Alert>;
        }

        let severity = null;

        if (status === 'NO-HIT-YELLOW' || status === 'HIT-YELLOW') {
            severity = 'warning';
        } else if (status === 'HIT-RED') {
            severity = 'error';
        }

        return (
            <Alert icon={false} severity={severity}>
                <div className={styles.content}>
                    {result.guidanceText}
                </div>
            </Alert>
        );
    }

    if (!result.guidanceText) {
        return null;
    }

    return (
        <div className='section'>
            <div className={styles.content}>
                {renderGuidanceText()}
            </div>
        </div>
    );
}