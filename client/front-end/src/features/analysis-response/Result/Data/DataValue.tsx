import { Link } from '@digdir/designsystemet-react';

interface DataValueProps {
    value: unknown;
}

export default function DataValue({ value }: DataValueProps) {
    if (value === null) return "-";

    if (typeof value === 'string' && value.startsWith('http')) {
        return (
            <Link href={value} target="_blank" rel="noopener noreferrer">
                {value}
            </Link>
        );
    }

    return String(value);
}