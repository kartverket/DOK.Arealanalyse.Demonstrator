import { Link } from 'react-router';
import { PATHS } from '@/app/paths';
import { DibkSectionHeader, Paragraph } from 'dibk-designsystemet';
import styles from './NotFoundPage.module.scss';

export default function NotFoundPage() {
    return (
        <div className={styles.notFoundPage}>
            <DibkSectionHeader title="Siden finnes ikke" />

            <Paragraph>
                Vi fant ikke siden du lette etter.{' '}
                <Link to={PATHS.analysis}>Gå til forsiden</Link>
            </Paragraph>
        </div>
    );
}
