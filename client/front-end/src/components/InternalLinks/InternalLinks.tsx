import { useState } from 'react';
import styles from './InternalLinks.module.scss';

import type { InternalLink } from './InternalLinks.types';

interface InternalLinksProps {
    links: InternalLink[];
    className?: string;
}

export default function InternalLinks({
    links,
    className = '',
}: InternalLinksProps) {
    const [selected, setSelected] = useState(links[0].id);

    function handleClick(id: string) {
        const element = document.getElementById(id);
        if (element !== null) {
            setSelected(id);

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }

    return (
        <div className={`${styles.internalLinks} ${className}`}>
            {links.map((link) => (
                <button
                    key={link.id}
                    onClick={() => handleClick(link.id)}
                    className={`${styles.internalLink} ${selected === link.id ? styles.selected : ''}`}
                >
                    {link.title}
                </button>
            ))}
        </div>
    );
}
