import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';

export function createAreaStyle() {
    return new Style({
        stroke: new Stroke({
            color: '#d33333',
            width: 4
        }),
        fill: new Fill({
            color: 'transparent'
        })
    });
}

export function createBufferStyle() {
    return new Style({
        stroke: new Stroke({
            color: '#d33333',
            lineDash: [8, 8],
            width: 2
        })
    });
}

export function createEditStyle() {
    return new Style({
        stroke: new Stroke({
            color: '#d33333',
            width: 4
        }),
        fill: new Fill({
            color: '#d333333d'
        })
    });
}

export function createDrawStyle() {
    return new Style({
        stroke: new Stroke({
            color: '#d33333',
            width: 4
        }),
        fill: new Fill({
            color: 'transparent'
        }),
        image: new CircleStyle({
            radius: 8,
            fill: new Fill({
                color: '#d33333'
            })
        })
    });
}


