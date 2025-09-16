import { Button, Paper, Tooltip } from "@mui/material";
import { buildQueryFromInputGeometry } from "./helpers";
import styles from "./Map.module.scss";

export default function Map({ rasterResult, inputGeometry }) {
   if (!rasterResult) {
      return null;
   }

   const url = `${
      import.meta.env.VITE_DATAFUNN_URL
   }/${buildQueryFromInputGeometry(inputGeometry)}`;

   return (
      <Paper className={styles.mapImage}>
         <div>
            <img src={rasterResult} alt="Kartutsnitt" />
         </div>

         <div className={styles.buttonContainer}>
            <Tooltip
               slotProps={{ tooltip: { sx: { fontSize: "1em" } } }}
               title="Mulighet for å melde inn feil eller mangler i temadata til en førstelinje behandling i en konseptutprøving i geolett 2 datafunn"
            >
               <Button
                  className={styles.button}
                  variant="contained"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  Meld feil i kartet (Test)
               </Button>
            </Tooltip>
         </div>
      </Paper>
   );
}
