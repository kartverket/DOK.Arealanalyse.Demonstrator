import type { AnalysisData } from '@/types/analysis.types';
import type { CrsGeometry } from '@/types/geo.types';

export function getBufferedGeometry(data: AnalysisData): CrsGeometry | null {
    const factPart = data.factList[0];

    return factPart !== undefined && factPart.buffer > 0 ?
        factPart.runOnInputGeometry :
        null;
}
