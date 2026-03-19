import { useAnalyses } from 'context';
import { Table } from '@digdir/designsystemet-react';
import { Progress } from 'features';
import ResponseTableRow from './ResponseTableRow';
import styles from './ResponseTable.module.scss';

export default function ResponseTable({ resultList }) {
    const { busy } = useAnalyses();

    return (
        !busy ?
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
            </div> :
            <Progress />
    );
}