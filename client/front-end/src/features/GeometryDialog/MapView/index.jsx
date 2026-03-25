import { useEffect, useRef, useState } from 'react';
import { createOutlineMap, getLayer } from 'utils/map';
import { ZoomToExtent } from 'ol/control';
import basemap from 'config/basemap.config';
import styles from './MapView.module.scss';

export default function MapView({ geometry }) {
   const [map, setMap] = useState(null);
   const mapElementRef = useRef(null);

   useEffect(
      () => {
         if (!geometry) {
            return;
         }

         (async () => {
            const olMap = await createOutlineMap(geometry);
            setMap(olMap);
         })();
      },
      [geometry]
   );

   useEffect(
      () => {
         if (!map) {
            return;
         }

         map.setTarget(mapElementRef.current);

         const vectorLayer = getLayer(map, 'features');
         const extent = vectorLayer.getSource().getExtent();
         const view = map.getView();

         view.fit(extent, map.getSize());
         view.setMinZoom(basemap.minZoom);
         view.setMaxZoom(basemap.maxZoom);

         const currentZoom = view.getZoom();

         if (currentZoom > basemap.maxZoom) {
            view.setZoom(basemap.maxZoom);
         }

         map.addControl(new ZoomToExtent({ extent }));

         return () => {
            map.dispose();
         }
      },
      [map]
   );

   return (
      <div ref={mapElementRef} className={styles.map}></div>
   );
}