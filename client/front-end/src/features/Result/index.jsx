import { marked } from 'marked';
import { RESULT_STATUS } from 'utils/constants';
import { Heading } from '@digdir/designsystemet-react';
import { getSectionOptions } from './helpers';
import { InternalLinks } from 'components';
import Actions from './Actions';
import Analyzis from './Analyzis';
import Data from './Data';
import Dataset from './Dataset';
import Map from './Map';
import Quality from './Quality';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react';
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react';
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react';
import styles from './Result.module.scss';

export default function Result({ result, inputGeometry }) {
    const data = result.data;
    const hitAreaOrDistance = getHitAreaOrDistance();
    const { show, internalLinks } = getSectionOptions(result);

    function renderTitle() {
        return (
            <div className={styles.title}>
                {
                    result.title !== null ?
                        <>
                            <Heading level={5}>{result.datasetTitle}</Heading>
                            <Heading level={2} className={styles.title}>{result.title}</Heading>
                        </> :
                        <Heading level={2} className={styles.title}>{result.datasetTitle}</Heading>
                }
            </div>
        );
    }

    function getHitAreaOrDistance() {
        if (result.hitArea.formatted !== null) {
            return result.hitArea.formatted;
        } else if (result.distance.formatted !== null) {
            return result.distance.formatted;
        }

        return null;
    }

    function getStatusClassName() {
        switch (result.status) {
            case RESULT_STATUS.HIT_RED:
                return styles.mustHandle;
            case RESULT_STATUS.HIT_YELLOW:
            case RESULT_STATUS.NO_HIT_YELLOW:
            case RESULT_STATUS.NOT_IMPLEMENTED:
            case RESULT_STATUS.TIMEOUT:
            case RESULT_STATUS.ERROR:
                return styles.mustCheck;
            case RESULT_STATUS.NO_HIT_GREEN:
                return styles.nearby;
            case RESULT_STATUS.NOT_RELEVANT:
                return styles.notAnalyzed;
            default:
                return null;
        }
    }

    function renderStatus() {
        switch (result.status) {
            case RESULT_STATUS.HIT_RED:
                return (
                    <span className={styles.status}>
                        <MustHandleIcon />
                        Må håndteres
                    </span>
                );
            case RESULT_STATUS.HIT_YELLOW:
            case RESULT_STATUS.NO_HIT_YELLOW:
            case RESULT_STATUS.NOT_IMPLEMENTED:
            case RESULT_STATUS.TIMEOUT:
            case RESULT_STATUS.ERROR:
                return (
                    <span className={styles.status}>
                        <MustCheckIcon />
                        Må sjekkes
                    </span>
                );
            case RESULT_STATUS.NO_HIT_GREEN:
                return (
                    <span className={styles.status}>
                        <NearbyIcon />
                        I nærheten
                    </span>
                );
            case RESULT_STATUS.NOT_RELEVANT:
                return (
                    <span className={styles.status}>
                        <NotAnalyzedIcon />
                        Ikke analysert
                    </span>
                );
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

    function scrollToTop() {

    }

    return (
        <div className={`${styles.result} ${getStatusClassName()}`}>
            <div className={styles.heading}>
                {renderTitle()}

                {
                    hitAreaOrDistance !== null && (
                        <div className={styles.hitAreaOrDistance}>
                            {hitAreaOrDistance}
                        </div>
                    )
                }
            </div>

            <div className={styles.statusAndThemes}>
                {renderStatus()}

                <span className={styles.themes}>
                    {
                        result.themes.map(theme => (
                            <span key={theme} className={styles.theme}>{theme}</span>
                        ))
                    }
                </span>
            </div>

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