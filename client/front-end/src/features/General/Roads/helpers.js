export const COLOR_MAP = {
    'Kommunal veg': 'rgba(244, 164, 96, 1)',
    'Gang og sykkelveg': 'rgba(218, 105, 74, 1)',
    'Privat veg': 'rgba(89, 187, 171, 1)',
    'Fylkesveg': '#FF5050',
    'Rundkjøring': 'rgba(153, 102, 255, 0.7)',
    'Kanalisert veg': 'rgba(255, 159, 64, 0.8)',
    'Fortau': 'rgba(89, 187, 171, 0.8)',
    'Gangveg': 'rgba(218, 105, 74, 1)',
    'Gangfelt': 'rgba(255, 159, 64, 1)'
};

export function getChartData(roads) {
    if (!roads.length) {
        return null;
    }

    return {
        labels: roads.map(item => item.roadType),
        datasets: [
            {
                label: 'Lengde (m)',
                data: roads.map(item => item.length),
                backgroundColor: roads.map(item => COLOR_MAP[item.roadType] || 'rgba(201, 203, 207, 0.6)'),
                borderColor: roads.map(item => COLOR_MAP[item.roadType] || 'rgba(201, 203, 207, 1)'),
                borderWidth: 1
            }
        ]
    };
}

export const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
            position: 'top',
        },
        title: {
            display: true,
            text: 'Vegtype',
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Lengde (m)',
            }
        },
        x: {
            title: {
                display: true,
                text: 'Vegtype',
            }
        }
    },
    maintainAspectRatio: false,
    locale: 'nb-NO'
};