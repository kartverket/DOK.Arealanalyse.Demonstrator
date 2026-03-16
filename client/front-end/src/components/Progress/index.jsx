import { useSelector } from 'react-redux';
import { STATE_STATUS } from 'utils/progress';
import { PROGRESS_VARIANT } from 'features/ResultTable/Progress/LinearProgress';
import { LinearProgress } from 'components';
import styles from './Progress.module.scss';

export default function Progress() {
    const state = useSelector(state => state.analysis);
    console.log(state);
    
    function renderProgressBar() {
        let variant = PROGRESS_VARIANT.DETERMINATE;
        let value = 0;

        if (state.status === STATE_STATUS.ANALYZING_DATASETS) {
            value = 1 / state.analysesTotal;
        } else if (state.status === STATE_STATUS.DATASET_ANALYZED) {
            value = state.analysisCount / state.analysesTotal;
        } else if (state.status === STATE_STATUS.CREATING_MAP_IMAGES) {
            value = 1 / state.mapImagesTotal;
        } else if (state.status === STATE_STATUS.MAP_IMAGE_CREATED) {
            value = state.mapImageCount / state.mapImagesTotal;
        } else {
            variant = PROGRESS_VARIANT.INDETERMINATE;
        }

        return <LinearProgress variant={variant} value={value} />;
    }

    return (
        <div className={styles.progress}>
            <span className={styles.status}>{state.statusText}</span>

            <div className={styles.progressBar}>
                {renderProgressBar()}
            </div>
        </div>
    );
}
