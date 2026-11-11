export function flattenObject(obj, parentKey = '', level = 0) {
    const result = [];

    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            const arrayKey = `${parentKey}[${index}]`;

            if (typeof item === 'object' && item !== null) {
                result.push(...flattenObject(item, arrayKey, level + 1));
            } else {
                result.push({
                    label: arrayKey,
                    value: item,
                    level,
                });
            }
        });

        return result;
    }

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        if (Array.isArray(value)) {
            result.push(...flattenObject(value, fullKey, level + 1));
        } else if (value !== null && typeof value === 'object') {
            result.push(...flattenObject(value, fullKey, level + 1));
        } else {
            result.push({
                label: fullKey,
                value,
                level,
            });
        }
    }

    return result;
}