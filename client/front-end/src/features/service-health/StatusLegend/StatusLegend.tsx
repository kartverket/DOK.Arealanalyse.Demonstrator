import { Cluster } from 'dibk-designsystemet/layout';
import { DAY_DOWN_THRESHOLD } from '../constants';
import styles from './StatusLegend.module.scss';

const ITEMS = [
    { status: 'ok', label: 'OK' },
    { status: 'slow', label: 'Ustabil eller treg' },
    { status: 'degraded', label: 'Avvik' },
    {
        status: 'down',
        label: `Nede (under ${DAY_DOWN_THRESHOLD} % tilgjengelig)`,
    },
    { status: 'none', label: 'Ingen data' },
];

export default function StatusLegend() {
    return (
        <Cluster
            gap="md"
            as="ul"
            className={styles.legend}
            aria-label="Forklaring til historikken"
        >
            {ITEMS.map((item) => (
                <li key={item.status}>
                    <span
                        className={styles.swatch}
                        data-status={item.status}
                        aria-hidden
                    />
                    {item.label}
                </li>
            ))}
        </Cluster>
    );
}
