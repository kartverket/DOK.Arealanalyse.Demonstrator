import useFormField, { type BooleanFieldName } from '../useFormField';
import { Checkbox } from 'dibk-designsystemet';

import type { ChangeEvent } from 'react';

interface CheckboxFieldProps {
    name: BooleanFieldName;
    label: string;
}

export default function CheckboxField({ name, label }: CheckboxFieldProps) {
    const [checked, setChecked] = useFormField(name);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setChecked(event.target.checked);
    }

    return (
        <Checkbox
            name={name}
            checked={checked}
            onChange={handleChange}
            label={label}
        />
    );
}
