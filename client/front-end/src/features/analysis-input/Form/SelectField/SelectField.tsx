import useFormField, { type StringFieldName } from '../useFormField';
import { Field, Label, Select } from 'dibk-designsystemet';

import type { ChangeEvent, ReactNode } from 'react';

interface SelectFieldProps {
    name: StringFieldName;
    label: string;
    children: ReactNode;
}

export default function SelectField({
    name,
    label,
    children,
}: SelectFieldProps) {
    const [value, setValue] = useFormField(name);

    function handleChange(event: ChangeEvent<HTMLSelectElement>) {
        setValue(event.target.value);
    }

    return (
        <Field>
            <Label>{label}</Label>
            <Select
                name={name}
                value={value}
                onChange={handleChange}
            >
                {children}
            </Select>
        </Field>
    );
}
