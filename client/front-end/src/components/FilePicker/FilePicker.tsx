import { useId, useState, type ChangeEvent } from 'react';
import { FileIcon } from '@navikt/aksel-icons';
import styles from './FilePicker.module.scss';

type FilePickerProps = {
    label: string;
    fileTypes: string[];
} & (
    | { multiple?: false; onFileSelected: (file: File | null) => void }
    | { multiple: true; onFileSelected: (files: File[]) => void }
);

export default function FilePicker(props: FilePickerProps) {
    const { label, fileTypes } = props;
    const id = useId()
    const [value, setValue] = useState<string[]>([]);
    const accept = fileTypes.map(type => `.${type}`).join(', ');

    function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
        const files = [...(event.target.files ?? [])];

        if (!props.multiple) {
            props.onFileSelected(files[0] || null);
        } else {
            props.onFileSelected(files)
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