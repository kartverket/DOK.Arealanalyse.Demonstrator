import { useState } from 'react';
import { LinkItUrl } from 'react-linkify-it';
import styles from './ExpandableText.module.scss';

export default function ExpandableText({ text, limit = 200 }) {
    const [expanded, setExpanded] = useState(false);

    if (text.length <= limit) {
        return (
            <LinkItUrl className="ds-link">
                {text}
            </LinkItUrl>
        );
    }

    const displayText = expanded
        ? text
        : `${text.substring(0, limit)}...`;

    return (
        <>
            <LinkItUrl className="ds-link">
                <span className={styles.text}>{displayText}</span>
            </LinkItUrl>

            <button
                onClick={() => setExpanded(!expanded)}
                className={styles.button}
            >
                {expanded ? 'Vis mindre...' : 'Vis mer...'}
            </button>
        </>
    );
}