import { marked } from 'marked';
import { Heading, Link, List } from '@digdir/designsystemet-react';
import { ExternalLinkIcon } from '@navikt/aksel-icons';
import styles from './Actions.module.scss';

export default function Actions({ result }) {
    return (
        <>
            <Heading level={3}>Tiltak</Heading>

            <div className={styles.actions}>
                {
                    result.data.guidanceText !== null && (
                        <div>
                            <Heading level={4}>Vurdering av konsekvens</Heading>

                            <div>
                                {result.data.guidanceText}
                            </div>
                        </div>
                    )
                }

                {
                    result.data.possibleActions.length > 0 && (
                        <div>
                            <Heading level={4}>Mulige tiltak</Heading>

                            <List.Unordered>
                                {
                                    result.data.possibleActions.map(action => (
                                        <List.Item
                                            key={action}
                                            dangerouslySetInnerHTML={{ __html: marked.parse(action.trim()) }}
                                        >
                                        </List.Item>
                                    ))
                                }
                            </List.Unordered>
                        </div>
                    )
                }

                {
                    result.data.guidanceUri.length > 0 && (
                        <div>
                            <Heading level={4}>Lenker</Heading>

                            <div className={styles.links}>
                                {
                                    result.data.guidanceUri.map(link => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLinkIcon title="Link" fontSize="1.5rem" />
                                            {link.title}
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    );
}