const mapCache = new Map<string, string>();

function getMapImage(key: string): string | null {
    return mapCache.get(key) || null;
}

function setMapImage(key: string, value: string): void {
    mapCache.set(key, value);
}

const caching = {
    getMapImage,
    setMapImage
}

export default caching;