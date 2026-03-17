import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import RcDrawer from 'rc-drawer';
import { getResult, motionProps } from './helpers';
import { Result } from 'features';
import { useAnalyses } from 'context';

export default function Drawer() {
    const { response } = useAnalyses();
    const [selectedResult, setSelectedResult] = useState(null);
    const selectedResultId = useSelector(state => state.app.selectedResultId);
    const resultIds = useSelector(state => state.app.filteredResultIds);

    useEffect(
        () => {
            if (response === null) {
                return;
            }
            
            if (selectedResultId !== 0) {
                const result = getResult(response.resultList, selectedResultId);
                setSelectedResult(result);
            } else {
                setSelectedResult(null);
            }
        },
        [response, selectedResultId]
    );

    return (
        <RcDrawer
            open={selectedResult !== null}
            placement="right"
            width="50%"
            {...motionProps}
        >
            {
                selectedResult !== null && (
                    <Result 
                        result={selectedResult} 
                        resultIds={resultIds}
                    /> 
                )
            }
        </RcDrawer>
    );
}