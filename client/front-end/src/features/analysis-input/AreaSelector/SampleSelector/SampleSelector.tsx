import { useRef, useState } from 'react';
import { useGetEksemplerQuery } from '@/lib/api/api';
import { Button, Dropdown } from 'dibk-designsystemet';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';
import styles from './SampleSelector.module.scss';

import type { Sample } from '@/types/api.types';

interface SampleSelectorProps {
    selectedSample: Sample | null;
    onSampleSelect: (sample: Sample) => void;
}

export default function SampleSelector({
    selectedSample,
    onSampleSelect,
}: SampleSelectorProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { data } = useGetEksemplerQuery();
    const samples = data?.features ?? [];
    const dropdownTriggerRef = useRef<HTMLButtonElement>(null);

    function handleSampleSelect(sample: Sample) {
        setDropdownOpen(false);
        onSampleSelect(sample);
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
                {selectedSample?.properties.navn || 'Velg eksempel'}
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
                                    selectedSample?.properties.navn ===
                                    sample.properties.navn
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
