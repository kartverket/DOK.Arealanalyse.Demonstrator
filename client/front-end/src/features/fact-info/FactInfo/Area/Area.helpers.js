export const COLOR_MAP = {
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

export function getChartData(areaTypes) {
    if (!areaTypes.length) {
        return null;
    }

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

export const chartOptions = {
    plugins: {
        legend: {
            display: false
        }
    },
    locale: 'nb-NO'
};