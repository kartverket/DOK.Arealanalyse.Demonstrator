import { useId, useState } from 'react';
import { FileIcon, UploadIcon } from '@navikt/aksel-icons';
import styles from './FilePicker.module.scss';

export default function FilePicker({ label, fileTypes, multiple = false, onFileSelected }) {
    const id = useId()
    const [value, setValue] = useState([]);
    const accept = fileTypes.map(type => `.${type}`).join(', ');

    function handleFileSelected(event) {
        const files = [...event.target.files];

        if (!multiple) {
            onFileSelected(files[0] || null);
        } else {
            onFileSelected(files)
        }

        setValue([]);
    }

    return (
        <div className={styles.filePicker}>
            <label 
                htmlFor={id}
                role="button"
                aria-label="Legg til fil"
                className={`ds-button ${styles.button}`}
            >
                <FileIcon aria-hidden />
                {label}
            </label>

            <input
                id={id}
                type="file" 
                value={value}
                onChange={handleFileSelected}
                accept={accept} 
                multiple
            />
        </div>
    );
}