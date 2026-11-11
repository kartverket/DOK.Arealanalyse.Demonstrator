import type { ChartData, ChartOptions } from 'chart.js';
import type { AreaType } from '@/types/api.types';

export const COLOR_MAP: Record<string, string> = {
    'Bebygd': 'rgb(252,219,214)',
    'Skog': 'rgb(158,204,115)',
    'Åpen fastmark': '#D9D9D9',
    'Samferdsel': 'rgb(179,120,76)',
    'Fulldyrka jord': '#FFD16E',
    'Ferskvann': '#91E7FF',
    'Hav': '#D2FFFF',
    'Ikke kartlagt': '#CCCCCC',
    'Innmarksbeite': '#FFFA56',
    'Myr': '#73DFE1',
    'Overflatedyrka jord': '#FFCD56',
    'Snøisbre': '#ffffff',
};

export function getChartData(areaTypes: AreaType[]): ChartData<'pie'> {
    return {
        labels: areaTypes.map(item => item.areaType),
        datasets: [
            {
                label: 'Areal (m²)',
                data: areaTypes.map(item => item.area),
                backgroundColor: areaTypes.map(item => COLOR_MAP[item.areaType] || '#E7E9ED'),
                hoverOffset: 4
            }
        ]
    };
}

export const chartOptions: ChartOptions<'pie'> = {
    plugins: {
        legend: {
            display: false
        }
    },
    locale: 'nb-NO'
};