import { Heading as DsHeading, Link } from 'dibk-designsystemet';
import logo from '@/assets/gfx/logo-kartverket.svg';
import styles from './Heading.module.scss';

const API_URL = import.meta.env.VITE_PYGEOAPI_URL;

export default function Heading() {
    return (
        <div className={styles.heading}>
            <img
                src={logo}
                alt="Kartverket logo"
            />

            <DsHeading level={1}>
                Arealanalyse av DOK-datasett - Demonstrator
            </DsHeading>

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
