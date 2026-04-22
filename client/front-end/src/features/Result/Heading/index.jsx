import { Heading as DsHeading } from '@digdir/designsystemet-react';
import styles from './Heading.module.scss';

export default function Heading({ result, className = '' }) {
    const hitAreaOrDistance = getHitAreaOrDistance();

    function getHitAreaOrDistance() {
        if (result.hitArea.formatted !== null) {
            return result.hitArea.formatted;
        } else if (result.distance.formatted !== null) {
            return result.distance.formatted;
        }

        return null;
    }

    function renderTitle() {
        return (
            <div className={styles.title}>
                {
                    result.title !== null ?
                        <>
                            <DsHeading level={5}>{result.datasetTitle}</DsHeading>
                            <DsHeading level={2} className={styles.title}>{result.title}</DsHeading>
                        </> :
                        <DsHeading level={2} className={styles.title}>{result.datasetTitle}</DsHeading>
                }
            </div>
        );
    }

    return (
        <div className={`${styles.heading} ${className}`}>
            {renderTitle()}
            {
                hitAreaOrDistance !== null && (
                    <div className={styles.hitAreaOrDistance}>
                        {hitAreaOrDistance}
                    </div>
                )
            }
        </div>
    );
}