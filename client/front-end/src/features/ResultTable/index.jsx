import { Button, Table } from '@digdir/designsystemet-react';
import styles from './ResultTable.module.scss';

export default function ResultTable({ result }) {
    function getHitAreaOrDistance(resultItem) {
        if (resultItem.hitArea.formatted !== null) {
            return resultItem.hitArea.formatted;
        } else if (resultItem.distance.formatted !== null) {
            return resultItem.distance.formatted;
        }

        return null;
    }

    return (
        <div>
            <Table className={styles.resultTable}>
                <Table.Head>
                    <Table.Row>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Tema</Table.HeaderCell>
                        <Table.HeaderCell>Beskrivelse</Table.HeaderCell>
                        <Table.HeaderCell></Table.HeaderCell>
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    {
                        result.map(resultItem => (
                            <Table.Row key={resultItem._id}>
                                <Table.Cell>{resultItem.status}</Table.Cell>
                                <Table.Cell>
                                    <span className={styles.themes}>
                                        {
                                            resultItem.themes.map(theme => (
                                                <span key={theme} className={styles.theme}>{theme}</span>
                                            ))
                                        }
                                    </span>
                                </Table.Cell>
                                <Table.Cell>{resultItem.description}</Table.Cell>
                                <Table.Cell className={styles.hitAreaOrDistance}>{getHitAreaOrDistance(resultItem)}</Table.Cell>
                            </Table.Row>
                        ))
                    }
                </Table.Body>
            </Table>
        </div>
    )
}