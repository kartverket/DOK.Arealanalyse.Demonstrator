import { Button, Tooltip } from "@mui/material";
import bbox from "@turf/bbox";
import datafunn from "assets/gfx/datafunn.svg";
import useDatafunnUrl from "hooks/useDatafunnUrl";
import { getCrsName, getEpsgCode } from "utils/helpers";
import styles from "./DatafunnButton.module.scss";

const DATAFUNN_SYSTEM = "DOK Arealanalyse Demonstrator";

export default function DatafunnButton({ className, inputGeometry }) {
   const { datafunnUrl } = useDatafunnUrl();

   if (!inputGeometry) return null;

   const extent = bbox(inputGeometry);

   let queryString = `?extent=${extent.join(",")}`;

   const crsName = getCrsName(inputGeometry);
   const epsgCode = getEpsgCode(crsName);

   if (epsgCode) queryString += `&epsg=${epsgCode}`;
   queryString += `&system=${encodeURIComponent(DATAFUNN_SYSTEM)}`;

   return (
      <div className={className}>
         <Tooltip
            slotProps={{ tooltip: { sx: { fontSize: "1em" } } }}
            title="Mulighet for å melde inn feil eller mangler i temadata til en førstelinje behandling i en konseptutprøving i geolett 2 datafunn"
         >
            <Button
               variant="contained"
               href={datafunnUrl ? `${datafunnUrl}/${queryString}` : ""}
               target="_blank"
               rel="noopener noreferrer"
            >
               <img className={styles.image} src={datafunn} /> Meld feil i
               kartet
            </Button>
         </Tooltip>
      </div>
   );
}
