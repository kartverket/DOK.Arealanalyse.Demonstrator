const mapCache = new Map();

function getMapImage(key) {
    return mapCache.get(key) || null;
}

function setMapImage(key, value) {
    mapCache.set(key, value);
}

const caching = {
    getMapImage,
    setMapImage
}

export default caching;