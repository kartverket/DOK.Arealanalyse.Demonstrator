import dayjs from 'dayjs';
import { Heading, Link } from '@digdir/designsystemet-react';
import { ExpandableText } from 'components';
import styles from './Dataset.module.scss';

export default function Dataset({ dataset }) {
    return (
        <>
            <Heading level={3}>Datasett</Heading>

            <div className={styles.dataset}>
                <div className={styles.row}>
                    <div className={styles.label}>Datasettnavn</div>
                    <div>{dataset.title}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.label}>Beskrivelse</div>
                    <div className={styles.description}>
                        <ExpandableText
                            text={dataset.description}
                            limit={240}
                        />
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.label}>Eier</div>
                    <div>{dataset.owner}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.label}>Oppdatert</div>
                    <div>{dayjs(dataset.updated).format('DD.MM.YYYY')}</div>
                </div>

                <div className={styles.row}>
                    <div className={styles.label}>Metadata</div>
                    <div>
                        <Link
                            href={dataset.datasetDescriptionUri}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {dataset.datasetDescriptionUri}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}