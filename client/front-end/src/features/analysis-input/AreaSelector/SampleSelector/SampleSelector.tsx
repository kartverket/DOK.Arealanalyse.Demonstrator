import { useRef, useState } from 'react';
import { useGetEksemplerQuery } from '@/lib/api/api';
import { setArea } from '@/app/appSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { getSampleTitle } from '../AreaSelector.helpers';
import { Button, Dropdown } from 'dibk-designsystemet';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';
import styles from './SampleSelector.module.scss';

import type { Sample } from '@/types/api.types';

export default function SampleSelector() {
    const selectedName = useAppSelector((state) => {
        const source = state.app.area?.source;
        return source?.type === 'sample' ? source.name : null;
    });
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dispatch = useAppDispatch();
    const { data } = useGetEksemplerQuery();
    const samples = data?.features ?? [];
    const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

    function handleSampleSelect(sample: Sample) {
        setDropdownOpen(false);
        dispatch(
            setArea({
                geometry: sample.geometry,
                title: getSampleTitle(sample.properties),
                source: { type: 'sample', name: sample.properties.navn },
            }),
        );
    }

    function handleLabelClick() {
        dropdownTriggerRef.current?.focus({ focusVisible: true });
    }

    return (
        <div className={`ds-field ${styles.sampleSelector}`}>
            <div
                onClick={handleLabelClick}
                className="ds-label"
            >
                Eksempel
            </div>

            <div data-field="description">
                Velg et forhåndsdefinert eksempel
            </div>

            <Button
                ref={dropdownTriggerRef}
                variant="secondary"
                className={styles.dropdownTrigger}
                popovertarget="sampleDropdown"
            >
                {selectedName ?? 'Velg eksempel'}
                {dropdownOpen ? (
                    <ChevronUpIcon aria-hidden />
                ) : (
                    <ChevronDownIcon aria-hidden />
                )}
            </Button>

            <Dropdown
                id="sampleDropdown"
                open={dropdownOpen}
                onOpen={() => setDropdownOpen(true)}
                onClose={() => setDropdownOpen(false)}
                placement="bottom-end"
                className={styles.dropdown}
            >
                <Dropdown.List>
                    {samples.map((sample) => (
                        <Dropdown.Item key={sample.properties.navn}>
                            <Dropdown.Button
                                onClick={() => handleSampleSelect(sample)}
                                className={
                                    selectedName === sample.properties.navn
                                        ? styles.selected
                                        : ''
                                }
                            >
                                <span className={styles.name}>
                                    {sample.properties.navn}
                                </span>
                                {sample.properties.beskrivelse !== null && (
                                    <span className={styles.description}>
                                        {sample.properties.beskrivelse}
                                    </span>
                                )}
                            </Dropdown.Button>
                        </Dropdown.Item>
                    ))}
                </Dropdown.List>
            </Dropdown>
        </div>
    );
}
