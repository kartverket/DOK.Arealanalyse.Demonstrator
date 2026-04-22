import { Heading, List } from '@digdir/designsystemet-react';
import styles from './Quality.module.scss';

export default function Quality({ qualityMeasurement }) {
    return (
        <>
            <Heading level={3}>Kvalitet</Heading>

            <div className={styles.quality}>
                <List.Unordered>
                    {
                        qualityMeasurement.map((measurement, index) => (
                            <List.Item key={index}>
                                <span className={styles.name}>
                                    {measurement.qualityDimensionName}:
                                </span>
                                <span className={styles.value}>
                                    {measurement.value}
                                </span>
                                {
                                    measurement.comment !== null && (
                                        <span>({measurement.comment})</span>
                                    )
                                }
                            </List.Item>
                        ))
                    }
                </List.Unordered>
            </div>
        </>
    );
}