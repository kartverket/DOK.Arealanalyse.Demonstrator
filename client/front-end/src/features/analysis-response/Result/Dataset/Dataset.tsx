import dayjs from 'dayjs';
import FormattedText from '@/components/FormattedText/FormattedText';
import { Heading, Link } from '@digdir/designsystemet-react';
import styles from './Dataset.module.scss';

import type { Dataset as DatasetType } from '@/types/api.types';

interface DatasetProps {
    dataset: DatasetType;
}

export default function Dataset({ dataset }: DatasetProps) {
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
                        <FormattedText
                            text={dataset.description}
                            maxLength={240}
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
