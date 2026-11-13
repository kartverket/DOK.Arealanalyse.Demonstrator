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
    const { data: samples = [] } = useGetEksemplerQuery();
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

            <div data-field="description">Velg et forhåndsdefinert eksempel</div>

            <Button
                ref={dropdownTriggerRef}
                variant="secondary"
                className={styles.dropdownTrigger}
                popovertarget="sampleDropdown"
            >
                {selectedSample?.name || 'Velg eksempel'}
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
                        <Dropdown.Item key={sample.name}>
                            <Dropdown.Button
                                onClick={() => handleSampleSelect(sample)}
                                className={
                                    selectedSample?.name === sample.name
                                        ? styles.selected
                                        : ''
                                }
                            >
                                <span className={styles.name}>
                                    {sample.name}
                                </span>
                                {sample.description !== null && (
                                    <span className={styles.description}>
                                        {sample.description}
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
