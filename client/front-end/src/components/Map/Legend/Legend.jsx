import { useState } from 'react';
import { Button, Heading } from '@digdir/designsystemet-react';
import { ChevronUpIcon, BulletListIcon  } from '@navikt/aksel-icons';
import styles from './Legend.module.scss';

export default function Legend({ cartographyUri, defaultExpanded = true }) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={`${styles.legend} ${expanded ? styles.expanded : ''}`}>
            <div className={styles.legendHeading}>
                <div>
                    <BulletListIcon fontSize="22px" aria-hidden />                    
                    <Heading level={5}>Tegneregler</Heading>
                </div>

                <Button
                    icon
                    onClick={() => setExpanded(!expanded)}
                    variant="tertiary"
                    title={expanded ? 'Skjul tegneregler' : 'Vis tegneregler'}
                    aria-label={expanded ? 'Skjul tegneregler' : 'Vis tegneregler'}
                >
                    <ChevronUpIcon aria-hidden />
                </Button>
            </div>

            <div className={styles.imgWrapper}>
                <img src={cartographyUri} alt="Tegneregler" />
            </div>
        </div>
    );
}