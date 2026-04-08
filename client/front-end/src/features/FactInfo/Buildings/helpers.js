export const COLOR_MAP = {
    'Bolig': '#C48723',
    'Fritidsbolig - hytte': '#DCAA27',
    'Industri og lagerbygning': '#74A3D4',
    'Kontor- og forretningsbygning': '#74A3D4',
    'Samferdsels- og kommunikasjonsbygning': '#74A3D4',
    'Hotell og restaurantbygning': '#74A3D4',
    'Skole-, kultur-, idrett-, forskningsbygning': '#74A3D4',
    'Helse- og omsorgsbygning': '#74A3D4',
    'Fengsel, beredskapsbygning, mv.': '#74A3D4'
};

export function getChartData(buildings) {
    if (!buildings.length) {
        return null;
    }

    return {
        labels: buildings.map(item => item.category),
        datasets: [
            {
                label: 'Antall',
                data: buildings.map(item => item.count),
                backgroundColor: buildings.map(item => COLOR_MAP[item.category] || '#E7E9ED'),
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
    }
};