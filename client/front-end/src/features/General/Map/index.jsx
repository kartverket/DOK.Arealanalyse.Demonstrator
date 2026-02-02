import { Paper } from "@mui/material";
import DatafunnButton from "components/DatafunnButton";
import styles from "./Map.module.scss";

export default function Map({ rasterResult, inputGeometry }) {
   if (!rasterResult) {
      return null;
   }

   return (
      <Paper className={styles.mapImage}>
         <div className={styles.mapFrame}>
            <img src={rasterResult} alt="Kartutsnitt" />
            <DatafunnButton
               className={styles.buttonContainer}
               inputGeometry={inputGeometry}
            />
         </div>
      </Paper>
   );
}
