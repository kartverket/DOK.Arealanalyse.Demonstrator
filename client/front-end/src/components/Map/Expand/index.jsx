import { useDispatch, useSelector } from 'react-redux';
import { setMapDialogOpen, setMapDialogResultId } from 'store/slices/responseSlice';
import { ExpandIcon } from '@navikt/aksel-icons';
import styles from './Expand.module.scss';

export default function Expand() {
    const selectedResultId = useSelector(state => state.response.selectedResultId)
    const dispatch = useDispatch();

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
