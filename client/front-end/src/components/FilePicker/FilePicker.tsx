import { useRef, useState, type ChangeEvent } from 'react';
import { Button } from 'dibk-designsystemet';
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
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState<string[]>([]);
    const accept = fileTypes.map((type) => `.${type}`).join(', ');

    function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
        const files = [...(event.target.files ?? [])];

        if (!props.multiple) {
            props.onFileSelected(files[0] || null);
        } else {
            props.onFileSelected(files);
        }

        setValue([]);
    }

    function handleClick() {
        inputRef.current?.click();
    }

    return (
        <div className={styles.filePicker}>
            <Button
                onClick={handleClick}
                variant="secondary"
                aria-label="Legg til fil"
            >
                <FileIcon aria-hidden />
                {label}
            </Button>

            <input
                ref={inputRef}
                type="file"
                name="file"
                value={value}
                onChange={handleFileSelected}
                accept={accept}
                multiple
            />
        </div>
    );
}
