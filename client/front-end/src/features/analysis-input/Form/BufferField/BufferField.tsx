import useFormField from '../useFormField';
import { Field, Input, Label } from 'dibk-designsystemet';
import styles from './BufferField.module.scss';

import type { ChangeEvent } from 'react';

export default function BufferField() {
    const [value, setValue] = useFormField('requestedBuffer');

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setValue(Number(value) < 0 ? '0' : value);
    }

    return (
        <Field className={styles.bufferField}>
            <Label>Buffer</Label>
            <Field.Affixes>
                <Input
                    type="number"
                    min={0}
                    name="requestedBuffer"
                    value={value}
                    onChange={handleChange}
                />
                <Field.Affix>meter</Field.Affix>
            </Field.Affixes>
        </Field>
    );
}
