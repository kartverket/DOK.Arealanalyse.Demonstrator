const basemap = {
    wmtsUrl: 'https://cache.kartverket.no/v1/wmts/1.0.0/WMTSCapabilities.xml?request=GetCapabilities',
    layers: {
        topo: 'topo',
        topograatone: 'topograatone'
    },
    minZoom: 5,
    maxZoom: 19
};

export default basemap;
