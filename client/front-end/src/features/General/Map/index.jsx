import { Button, Paper, Tooltip } from "@mui/material";
import { buildQueryString } from "./helpers";
import styles from "./Map.module.scss";
import datafunn from "../../../assets/gfx/datafunn.svg";

const DATAFUNN_URL = import.meta.env.VITE_DATAFUNN_URL;

export default function Map({ rasterResult, inputGeometry }) {
    if (!rasterResult) {
        return null;
    }

    function renderDatafunnButton() {
        const queryString = buildQueryString(inputGeometry);

        if (queryString === null) {
            return null;
        }

        const url = `${DATAFUNN_URL}/${queryString}`;

        return (
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
                        <img src={datafunn} />  Meld feil i kartet (test)
                    </Button>
                </Tooltip>
            </div>
        );
    }

    return (
        <Paper className={styles.mapImage}>
            <div>
                <img src={rasterResult} alt="Kartutsnitt" />
            </div>

            {renderDatafunnButton()}
        </Paper>
    );
}
