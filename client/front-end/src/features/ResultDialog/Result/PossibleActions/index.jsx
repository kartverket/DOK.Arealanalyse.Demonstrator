import { Alert } from '@mui/material';
import styles from './PossibleActions.module.scss';

export default function PossibleActions({ result }) {
    function renderPossibleActions() {
        if (result.resultStatus === 'NO-HIT-GREEN') {
            return <Alert icon={false} severity="success">Ingen tiltak trenger å utføres</Alert>;
        }

        return (
            <div className={styles.content}>
                <h3>Mulige tiltak</h3>
                <ul className={styles.possibleActionsList}>
                    {
                        result.possibleActions.map(action => <li key={action}>{action}</li>)
                    }
                </ul>
            </div>
        );
    }

    if (!Array.isArray(result.possibleActions) || result.possibleActions.length === 0) {
        return null;
    }

    return (
        <div className="section">
            {renderPossibleActions()}
        </div>
    );
}