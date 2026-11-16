import { useCallback } from 'react';
import {
    setFormData,
    type AnalysisFormData,
    type FormDataField,
} from '@/app/appSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

// Hvert felt abonnerer kun på sin egen verdi, så et tastetrykk ikke rendrer hele skjemaet på nytt
export default function useFormField<K extends keyof AnalysisFormData>(
    name: K,
) {
    const value = useAppSelector((state) => state.app.formData[name]);
    const dispatch = useAppDispatch();

    const setValue = useCallback(
        (value: AnalysisFormData[K]) => {
            dispatch(setFormData({ name, value } as FormDataField));
        },
        [dispatch, name],
    );

    return [value, setValue] as const;
}

type FieldName<T> = {
    [K in keyof AnalysisFormData]: AnalysisFormData[K] extends T ? K : never;
}[keyof AnalysisFormData];

export type BooleanFieldName = FieldName<boolean>;
export type StringFieldName = FieldName<string>;
