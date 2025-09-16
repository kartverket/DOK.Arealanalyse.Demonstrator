import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import GeoJSON from "ol/format/GeoJSON";

export function buildQueryFromInputGeometry(inputGeometry) {
   if (!inputGeometry || inputGeometry.type !== "MultiPolygon") {
      throw new Error("Expected a GeoJSON-like MultiPolygon geometry.");
   }

   const epsgCode = extractEpsgCodeFromCrs(inputGeometry.crs) || "4326";
   const epsg = "EPSG:" + epsgCode;

   if (epsg === "EPSG:25833") {
      ensureEpsg25833IsDefined();
   } else {
      register(proj4);
   }

   const format = new GeoJSON();
   const geom = format.readGeometry(
      { type: "MultiPolygon", coordinates: inputGeometry.coordinates },
      { dataProjection: epsg, featureProjection: epsg }
   );

   let extent = geom.getExtent();

   const query = `?extent=${extent.join(",")}&epsg=${epsgCode}`;
   return query;
}

function ensureEpsg25833IsDefined() {
   if (!proj4.defs["EPSG:25833"]) {
      proj4.defs(
         "EPSG:25833",
         "+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs +type=crs"
      );
   }
   register(proj4);
}

function extractEpsgCodeFromCrs(crs) {
   if (!crs) return null;

   const name = crs?.properties?.name || crs?.name || "";
   const m = name.match(/EPSG[:]*[:]*([0-9]+)/i);
   return m ? m[1] : null;
}
