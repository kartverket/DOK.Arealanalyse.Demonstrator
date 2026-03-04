import { useSelector } from 'react-redux';
import { STATUS } from 'utils/progress';
import { PROGRESS_VARIANT } from 'components/LinearProgress';
import { LinearProgress } from 'components';
import styles from './Progress.module.scss';

export default function Progress() {
    const state = useSelector(state => state.analysis);
    console.log(state);
    
    function renderProgressBar() {
        let variant = PROGRESS_VARIANT.DETERMINATE;
        let value = 0;

        if (state.status === STATUS.ANALYZING_DATASETS) {
            value = 1 / state.analysesTotal;
        } else if (state.status === STATUS.DATASET_ANALYZED) {
            value = state.analysisCount / state.analysesTotal;
        } else if (state.status === STATUS.CREATING_MAP_IMAGES) {
            value = 1 / state.mapImagesTotal;
        } else if (state.status === STATUS.MAP_IMAGE_CREATED) {
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
