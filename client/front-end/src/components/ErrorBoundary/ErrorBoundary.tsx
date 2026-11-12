import { useEffect } from 'react';
import { useRouteError } from 'react-router';
import { Button, Heading, Paragraph } from 'dibk-designsystemet';
import { ArrowCirclepathIcon } from '@navikt/aksel-icons';
import styles from './ErrorBoundary.module.scss';

export default function ErrorBoundary() {
    const error = useRouteError();

    useEffect(() => {
        console.error('Error caught by boundary:', error);
    }, [error]);

    return (
        <div className={styles.errorBoundary}>
            <Heading level={1}>Noe gikk galt</Heading>

            <Paragraph>
                Det oppstod en feil som gjorde at appen ikke kunne lastes
                riktig.
                <br />
                Prøv å laste siden på nytt.
            </Paragraph>

            <Button onClick={() => window.location.reload()}>
                <ArrowCirclepathIcon aria-hidden />
                Last inn siden på nytt
            </Button>
        </div>
    );
}
