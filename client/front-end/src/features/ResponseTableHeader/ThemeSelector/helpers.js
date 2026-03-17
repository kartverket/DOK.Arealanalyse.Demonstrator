import { capitalizeFirstLetter } from 'utils/helpers';

export function getThemes(resultList) {
    const themes = [];

    Object.values(resultList).forEach(resultSet => {
        resultSet.forEach(result => {
            themes.push(...result.themes.map(capitalizeFirstLetter));
        });
    });

    themes.sort();
    
    return [... new Set(themes)];
}