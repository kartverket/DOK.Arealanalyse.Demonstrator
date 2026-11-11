import { useState } from 'react';
import styles from './InternalLinks.module.scss';

export default function InternalLinks({ links, className = '' }) {
    const [selected, setSelected] = useState(links[0].id)

    function handleClick(id) {
        const element = document.getElementById(id);

        if (element !== null) {
            setSelected(id);

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    return (
        <div className={`${styles.internalLinks} ${className}`}>
            {
                links.map(link => (
                    <button
                        key={link.id}
                        onClick={() => handleClick(link.id)}
                        className={`${styles.internalLink} ${selected === link.id ? styles.selected : ''}`}
                    >
                        {link.title}
                    </button>
                ))
            }
        </div>
    );
}