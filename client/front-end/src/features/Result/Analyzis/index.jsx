import { Heading } from '@digdir/designsystemet-react';
import styles from './Analyzis.module.scss';

export default function Analyzis({ result }) {
    const data = result.data;

    function getBuffer() {
        return `${data.buffer.toLocaleString('nb-NO')} m`;
    }

    function getInputGeometryArea() {
        return `${Math.round(data.inputGeometryArea).toLocaleString('nb-NO')} m²`;
    }

    function getHitArea() {
        return `${Math.round(data.hitArea).toLocaleString('nb-NO')} m²`;
    }

    return (
        <>
            <Heading level={3}>Analyse</Heading>

            <div className={styles.analyzis}>
                <div>
                    <Heading level={5}>Algoritmer kjørt</Heading>

                    <div className={styles.algorithms}>
                        {
                            data.runAlgorithm.map((algorithm, index) => (
                                <div key={index}>
                                    <span className={styles.number}>{index + 1}</span>
                                    <span className={styles.description}>{algorithm}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div>
                    <Heading level={5}>Resultater</Heading>

                    <div className={styles.results}>
                        <div className={styles.box}>
                            <Heading level={6}>Buffer brukt</Heading>
                            <span className={styles.value}>
                                {getBuffer()}
                            </span>
                        </div>

                        <div className={styles.box}>
                            <Heading level={6}>Områdeareal</Heading>
                            <span className={styles.value}>
                                {getInputGeometryArea()}
                            </span>
                        </div>

                        {
                            result.hitArea.formatted !== null && (
                                <div className={styles.box}>
                                    <Heading level={6}>Treffareal</Heading>
                                    <span className={styles.value}>
                                        {getHitArea()} ({result.hitArea.formatted})
                                    </span>
                                </div>
                            )
                        }

                        {
                            result.distance.formatted !== null && (
                                <div className={styles.box}>
                                    <Heading level={6}>Avstand til nærmeste objekt</Heading>
                                    <span className={styles.value}>
                                        {result.distance.formatted}
                                    </span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    );
}