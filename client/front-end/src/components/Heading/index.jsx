import { Heading, Link } from '@digdir/designsystemet-react';
import styles from './Heading.module.scss';
import logo from 'assets/gfx/logo-kartverket.svg';

const API_URL = import.meta.env.VITE_PYGEOAPI_URL;

export default function Headinwg() {
    return (
        <div className={styles.heading}>
            <img src={logo} alt="Kartverket logo" />
            <Heading level={1}>Arealanalyse av DOK-datasett - Demonstrator</Heading>
            
            <Link
                href={API_URL}
                target="_blank" 
                rel="noopener noreferrer" 
                data-color="neutral"
                className={styles.apiLink}
            >
                API for utviklere
            </Link>
        </div>
    );
}