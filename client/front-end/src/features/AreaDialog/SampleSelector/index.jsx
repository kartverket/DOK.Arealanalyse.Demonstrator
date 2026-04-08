import { useRef, useState } from 'react';
import { useFetcher } from 'hooks';
import { Dropdown } from '@digdir/designsystemet-react';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';
import styles from './SampleSelector.module.scss';

export default function SampleSelector({ selectedSample, onSampleSelect }) {
    // const [selectedSample, setSelectedSample] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { data: samples = [] } = useFetcher('/samples');
    const dropdownTriggerRef = useRef(null);

    function handleSampleSelect(sample) {
        // setSelectedSample(sample);
        setDropdownOpen(false);
        onSampleSelect(sample);
    }

    function handleLabelClick() {
        dropdownTriggerRef.current.focus({ focusVisible: true });
    }

    return (
        <div className={styles.sampleSelector}>
            <div
                onClick={handleLabelClick}
                className={styles.label}
            >
                Eksempel
            </div>

            <Dropdown.TriggerContext>
                <Dropdown.Trigger
                    ref={dropdownTriggerRef}
                    variant="secondary"
                    className={styles.dropdownTrigger}
                >
                    {selectedSample?.name || 'Velg eksempel'}
                    {dropdownOpen ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
                </Dropdown.Trigger>

                <Dropdown
                    open={dropdownOpen}
                    onOpen={() => setDropdownOpen(true)}
                    onClose={() => setDropdownOpen(false)}
                    placement="bottom-end"
                    className={styles.dropdown}
                >
                    <Dropdown.List>
                        {
                            samples.map(sample => (
                                <Dropdown.Item key={sample.name}>
                                    <Dropdown.Button
                                        onClick={() => handleSampleSelect(sample)}
                                        className={selectedSample?.name === sample.name ? styles.selected : ''}
                                    >
                                        <span className={styles.name}>{sample.name}</span>
                                        {
                                            sample.description !== null && (
                                                <span className={styles.description}>{sample.description}</span>
                                            )
                                        }
                                    </Dropdown.Button>
                                </Dropdown.Item>
                            ))
                        }
                    </Dropdown.List>
                </Dropdown>
            </Dropdown.TriggerContext>
        </div>
    );
}