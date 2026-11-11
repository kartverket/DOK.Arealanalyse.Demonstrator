export function parseJson(json: string): unknown {
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function debounce<TArgs extends unknown[]>(func: (...args: TArgs) => void, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return (...args: TArgs) => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

export function capitalizeFirstLetter(str: string | null | undefined): string {
    if (!str || typeof str !== 'string') {
        return '';
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isEmptyObject(value: unknown): boolean {
    return (
        value != null &&
        typeof value === 'object' &&
        Object.keys(value).length === 0
    );
}

export function createRandomId(): string {
    return `_${Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))}`;
}