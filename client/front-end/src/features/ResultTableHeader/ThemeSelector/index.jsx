import { useState } from 'react';
import { Checkbox, Dropdown } from '@digdir/designsystemet-react';
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';
import styles from './ThemeSelector.module.scss';

export default function ThemeSelector({ themes, selectedThemes, onThemeSelected }) {
    const [buttonText, setButtonText] = useState('Alle valgt');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    function handleThemeSelected(event) {
        const { value, checked } = event.target;
        let updatedThemes, buttonText;

        if (checked) {
            if (value === 'Alle') {
                updatedThemes = [...themes, 'Alle'];
                buttonText = 'Alle valgt';
            } else {
                updatedThemes = [...selectedThemes, value];

                if (updatedThemes.length === themes.length) {
                    updatedThemes = [...updatedThemes, 'Alle'];
                    buttonText = 'Alle valgt';
                } else {
                    buttonText = `${updatedThemes.length} valgt`;
                }
            }
        } else {
            if (value === 'Alle') {
                updatedThemes = [];
                buttonText = 'Ingen valgt';
            } else {
                updatedThemes = selectedThemes.filter(theme => theme !== value && theme !== 'Alle');
                buttonText = `${updatedThemes.length > 0 ? updatedThemes.length : 'Ingen'} valgt`;                
            }
        }

        onThemeSelected(updatedThemes);
        setButtonText(buttonText);
    }

    return (
        <Dropdown.TriggerContext>
            <Dropdown.Trigger 
                variant="secondary"
                className={styles.dropdownTrigger}
                disabled={true}
            >
                <span>
                    Tema: {buttonText}
                </span>                    
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
                    <div className={styles.dropdownItemWrapper}>
                        <Dropdown.Item>
                            <Checkbox
                                label="Alle"
                                value="Alle"
                                checked={selectedThemes.includes('Alle')}
                                onChange={handleThemeSelected}
                            />
                        </Dropdown.Item>
                    </div>
                    {
                        themes.map(theme => (
                            <div key={theme} className={styles.dropdownItemWrapper}>
                                <Dropdown.Item>
                                    <Checkbox
                                        label={theme}
                                        value={theme}
                                        checked={selectedThemes.includes(theme)}
                                        onChange={handleThemeSelected}
                                    />
                                </Dropdown.Item>
                            </div>
                        ))
                    }
                </Dropdown.List>
            </Dropdown>
        </Dropdown.TriggerContext>
    );
}