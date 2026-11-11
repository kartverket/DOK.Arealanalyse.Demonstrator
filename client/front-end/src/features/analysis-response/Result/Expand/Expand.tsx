import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setMapDialogOpen, setMapDialogResultId } from '../../responseSlice';
import { ExpandIcon } from '@navikt/aksel-icons';
import styles from './Expand.module.scss';

export default function Expand() {
    const selectedResultId = useAppSelector(state => state.response.selectedResultId)
    const dispatch = useAppDispatch();

    function expand() {
        dispatch(setMapDialogOpen(true));
        dispatch(setMapDialogResultId(selectedResultId))
    }

    return (
        <button
            className={styles.button}
            onClick={expand}
            title="Full visning"
            aria-label="Full visning"
        >
            <ExpandIcon fontSize="1.5rem" aria-hidden />
        </button>
    );
}
