import { marked } from 'marked';
import { ResultStatus } from 'utils/constants';
import { getSectionOptions } from './helpers';
import { InternalLinks } from 'components';
import Actions from './Actions';
import Analyzis from './Analyzis';
import Data from './Data';
import Dataset from './Dataset';
import Heading from './Heading';
import Map from './Map';
import Quality from './Quality';
import StatusAndThemes from './StatusAndThemes';
import styles from './Result.module.scss';

export default function Result({ result, inputGeometry }) {
    const data = result.data;
    const { show, internalLinks } = getSectionOptions(result);

    function getStatusClassName() {
        switch (result.status) {
            case ResultStatus.HIT_RED:
                return styles.mustHandle;
            case ResultStatus.HIT_YELLOW:
            case ResultStatus.NO_HIT_YELLOW:
            case ResultStatus.NOT_IMPLEMENTED:
            case ResultStatus.TIMEOUT:
            case ResultStatus.ERROR:
                return styles.mustCheck;
            case ResultStatus.NO_HIT_GREEN:
                return styles.nearby;
            case ResultStatus.NOT_RELEVANT:
                return styles.notAnalyzed;
            default:
                return null;
        }
    }

    function renderDescription() {
        if (data.description === null) {
            return null;
        }

        const html = marked.parse(data.description);

        return (
            <div
                dangerouslySetInnerHTML={{ __html: html }}
                className={styles.description}
            >
            </div>
        );
    }

    return (
        <div className={`${styles.result} ${getStatusClassName()}`}>
            <Heading result={result} />

            <StatusAndThemes 
                result={result} 
                statusClassName={styles.status}
            />

            {renderDescription()}

            {
                data.guidanceText !== null && (
                    <div className={styles.guidanceText}>
                        {data.guidanceText}
                    </div>
                )
            }

            <InternalLinks
                links={internalLinks}
                className={styles.internalLinks}
            />

            <div className={styles.sections}>
                {
                    show.map && (
                        <section id="section-map">
                            <Map
                                result={result}
                                inputGeometry={inputGeometry}
                            />
                        </section>
                    )
                }

                {
                    show.actions && (
                        <section id="section-actions">
                            <Actions
                                result={result}
                            />
                        </section>
                    )
                }

                {
                    show.data && (
                        <section id="section-data">
                            <Data 
                                dataList={data.data}
                            />
                        </section>
                    )
                }

                {
                    show.dataset && (
                        <section id="section-dataset">
                            <Dataset 
                                dataset={data.runOnDataset}
                            />
                        </section>
                    )
                }

                {
                    show.quality && (
                        <section id="section-quality">
                            <Quality
                                qualityMeasurement={data.qualityMeasurement}
                            />
                        </section>
                    )
                }

                {
                    show.analyzis && (
                        <section id="section-analyzis">
                            <Analyzis 
                                result={result} 
                            />
                        </section>
                    )
                }
            </div>
        </div>
    );
}