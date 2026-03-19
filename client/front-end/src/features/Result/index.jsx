import { useEffect, useState } from 'react';
import { marked } from 'marked';
import { RESULT_STATUS } from 'utils/constants';
import { Heading, Tabs } from '@digdir/designsystemet-react';
import { getTabVisibility } from './helper';
import MustHandleIcon from 'assets/gfx/icon-must-handle.svg?react';
import MustCheckIcon from 'assets/gfx/icon-must-check.svg?react';
import NearbyIcon from 'assets/gfx/icon-nearby.svg?react';
import NotAnalyzedIcon from 'assets/gfx/icon-not-analyzed.svg?react';
import styles from './Result.module.scss';
import { ResultMap } from 'features';

export default function Result({ result }) {
    const data = result.data;
    const hitAreaOrDistance = getHitAreaOrDistance();
    const tabVisibility = getTabVisibility(result);
    const [selectedTab, setSelectedTab] = useState(null);

    useEffect(
        () => {
            const { map, actions } = getTabVisibility(result);
            const tabId = map ? 'map' : actions ? 'actions' : 'data';
            setSelectedTab(tabId);
        },
        [result]
    );

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

            <Tabs value={selectedTab} onChange={setSelectedTab}>
                <Tabs.List>
                    {
                        tabVisibility.map && (
                            <Tabs.Tab value="map">Kart</Tabs.Tab>
                        )
                    }
                    {
                        tabVisibility.actions && (
                            <Tabs.Tab value="actions">Tiltak</Tabs.Tab>
                        )
                    }
                    <Tabs.Tab value="data">Data</Tabs.Tab>
                    <Tabs.Tab value="dataset">Datasett</Tabs.Tab>
                    {
                        tabVisibility.quality && (
                            <Tabs.Tab value="quality">Kvalitet</Tabs.Tab>
                        )
                    }
                    <Tabs.Tab value="analyzis">Analyse</Tabs.Tab>
                </Tabs.List>
                {
                    tabVisibility.map && (
                        <Tabs.Panel value="map">
                            <ResultMap result={result} />
                        </Tabs.Panel>
                    )
                }
                {
                    tabVisibility.actions && (
                        <Tabs.Panel value="actions">Tiltak</Tabs.Panel>
                    )
                }
                <Tabs.Panel value="data">Data</Tabs.Panel>
                <Tabs.Panel value="dataset">Datasett</Tabs.Panel>
                {
                    tabVisibility.quality && (
                        <Tabs.Panel value="quality">Kvalitet</Tabs.Panel>
                    )
                }
                <Tabs.Panel value="analyzis">Analyse</Tabs.Panel>
            </Tabs>
        </div>
    );
}