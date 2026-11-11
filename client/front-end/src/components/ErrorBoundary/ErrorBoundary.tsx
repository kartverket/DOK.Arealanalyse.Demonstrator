import React, { type ErrorInfo, type ReactNode } from 'react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import { ArrowCirclepathIcon } from '@navikt/aksel-icons';
import styles from './ErrorBoundary.module.scss';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.errorBoundary}>
                    <Heading level={1}>Noe gikk galt</Heading>

                    <Paragraph>
                        Det oppstod en feil som gjorde at appen ikke kunne
                        lastes riktig.
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

        return this.props.children;
    }
}

export default ErrorBoundary;
