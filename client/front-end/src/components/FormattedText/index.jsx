import { useState } from 'react';
import { Link, Paragraph } from '@digdir/designsystemet-react';
import styles from './FormattedText.module.scss';

const urlRegex = /(https?:\/\/[^\s]+)/g;
const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/g;

export default function FormattedText({ text, maxLength = 200 }) {
    const [expanded, setExpanded] = useState(false);

    const shouldTruncate = text.length > maxLength;
    const displayText = expanded || !shouldTruncate
        ? text
        : text.slice(0, maxLength) + '...';

    const renderLine = (line, lineIndex) => {
        const urlParts = line.split(urlRegex);

        return (
            <Paragraph key={lineIndex}>
                {urlParts.map((part, i) => {
                    if (part.match(urlRegex)) {
                        return (
                            <Link
                                key={i}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {part}
                            </Link>
                        );
                    }

                    const emailParts = part.split(emailRegex);

                    return emailParts.map((emailPart, j) => {
                        if (emailPart.match(emailRegex)) {
                            return (
                                <Link key={`${i}-${j}`} href={`mailto:${emailPart}`}>
                                    {emailPart}
                                </Link>
                            );
                        }

                        return emailPart;
                    });
                })}
            </Paragraph>
        );
    };

    const paragraphs = displayText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(renderLine);

    return (
        <>
            <div className={styles.paragraphs}>
                {paragraphs}
            </div>
            
            {shouldTruncate && (
                <button 
                    onClick={() => setExpanded(prev => !prev)}
                    className={styles.button}
                >
                    {expanded ? 'Vis mindre...' : 'Vis mer...'}
                </button>
            )}
        </>
    );
}
