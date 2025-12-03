import { Button, Tooltip } from "@mui/material";
import bbox from "@turf/bbox";
import datafunn from "assets/gfx/datafunn.svg";
import { getCrsName, getEpsgCode } from "utils/helpers";
import styles from "./DatafunnButton.module.scss";

const DATAFUNN_URL = import.meta.env.VITE_DATAFUNN_URL;

export default function DatafunnButton({ className, inputGeometry }) {
   if (!inputGeometry) return null;

   const extent = bbox(inputGeometry);

   let queryString = `?extent=${extent.join(",")}`;

   const crsName = getCrsName(inputGeometry);
   const epsgCode = getEpsgCode(crsName);

   if (epsgCode) queryString += `&epsg=${epsgCode}`;

   return (
      <div className={className}>
         <Tooltip
            slotProps={{ tooltip: { sx: { fontSize: "1em" } } }}
            title="Mulighet for å melde inn feil eller mangler i temadata til en førstelinje behandling i en konseptutprøving i geolett 2 datafunn"
         >
            <Button
               variant="contained"
               href={`${DATAFUNN_URL}/${queryString}`}
               target="_blank"
               rel="noopener noreferrer"
            >
               <img className={styles.image} src={datafunn} /> Meld feil i
               kartet (test)
            </Button>
         </Tooltip>
      </div>
   );
}
