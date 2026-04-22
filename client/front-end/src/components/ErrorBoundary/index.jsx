import React from 'react';
import { Button, Heading, Paragraph } from '@digdir/designsystemet-react';
import styles from './ErrorBoundary.module.scss';
import { ArrowCirclepathIcon } from '@navikt/aksel-icons';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.errorBoundary}>
                    <Heading level={1}>Noe gikk galt</Heading>
                    
                    <Paragraph>
                        Det oppstod en feil som gjorde at appen ikke kunne lastes riktig.<br />
                        Prøv å laste siden på nytt.                     
                    </Paragraph>

                    <Button 
                        onClick={() => window.location.reload()}
                    >
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