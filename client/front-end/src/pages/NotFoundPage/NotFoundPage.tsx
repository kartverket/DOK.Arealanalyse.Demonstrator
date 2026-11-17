import { useNavigate, Link as RouterLink } from 'react-router';
import { Heading, Link, Paragraph } from 'dibk-designsystemet';
import styles from './NotFoundPage.module.scss';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <Heading level={1}>Ressursen ble ikke funnet</Heading>

            <Paragraph>
                Vi kunne dessverre ikke finne ressursen du leter etter.&nbsp;
                <Link
                    href="#"
                    onClick={() => navigate(-1)}
                >
                    Gå tilbake
                </Link>{' '}
                eller til{' '}
                <Link asChild={true}>
                    <RouterLink to="/">forsiden</RouterLink>
                </Link>{' '}
                for å komme bort fra denne siden.
            </Paragraph>
        </div>
    );
}
