export function parseJson(json) {
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

export function capitalizeFirstLetter(str) {
    if (!str || typeof str !== 'string') {
        return '';
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isEmptyObject(value) {
    return (
        value != null &&
        typeof value === 'object' &&
        Object.keys(value).length === 0
    );
}

export function createRandomId() {
    return `_${Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))}`;
}