import { Table } from '@digdir/designsystemet-react';
import ResponseTableRow from './ResponseTableRow/ResponseTableRow';
import type { ResultItem } from '@/types/analysis.types';
import styles from './ResponseTable.module.scss';

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
                        {
                            resultList.map(result => (
                                <ResponseTableRow key={result.id} result={result} />
                            ))
                        }
                    </Table.Body>
                </Table>
            </div>
        </div>
    );
}