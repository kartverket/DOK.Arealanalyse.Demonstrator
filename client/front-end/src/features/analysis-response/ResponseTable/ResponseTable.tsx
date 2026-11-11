import ResponseTableRow from './ResponseTableRow/ResponseTableRow';
import { Table } from 'dibk-designsystemet';
import styles from './ResponseTable.module.scss';

import type { ResultItem } from '@/types/analysis.types';

interface ResponseTableProps {
    resultList: ResultItem[];
}

export default function ResponseTable({ resultList }: ResponseTableProps) {
    return (
        <div className={styles.tableContainer}>
            <div>
                <Table className={styles.responseTable}>
                    <Table.Head>
                        <Table.Row>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Tema</Table.HeaderCell>
                            <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
                            <Table.HeaderCell></Table.HeaderCell>
                            <Table.HeaderCell></Table.HeaderCell>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>
                        {resultList.map((result) => (
                            <ResponseTableRow
                                key={result.id}
                                result={result}
                            />
                        ))}
                    </Table.Body>
                </Table>
            </div>
        </div>
    );
}
