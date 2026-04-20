import { useDropzone } from 'react-dropzone';
import { Paragraph } from '@digdir/designsystemet-react';
import { CloudUpIcon } from '@navikt/aksel-icons';
import styles from './FileUpload.module.scss';

export default function FileUpload({ onFileSelected }) {
    const {
        getRootProps,
        getInputProps
    } = useDropzone({
        accept: {
            'application/geo+json': ['.geojson', '.json'],
            'application/gml+xml': ['.gml'],
            'text/vnd.sosi': ['.sos', '.sosi'],
            'application/geopackage+sqlite3': ['.gpkg']
        },
        multiple: false,
        getFilesFromEvent: event => handleFileSelected(event)
    });

    async function handleFileSelected(event) {
        const files = [...event.target.files];
        onFileSelected(files[0] || null);

        return files;
    }

    return (
        <section className={styles.container}>
            <div {...getRootProps({ className: styles.dropzone })}>
                <input {...getInputProps()} />

                <CloudUpIcon
                    width="36px"
                    height="36px"
                    aria-label="Upload icon"
                />

                <Paragraph>Dra og slipp en fil her, eller klikk for å velge</Paragraph>

                <span className={styles.acceptedFileTypes}>Støttede formater: GeoJSON, GML, SOSI, GeoPackage</span>
            </div>
        </section>
    );
}