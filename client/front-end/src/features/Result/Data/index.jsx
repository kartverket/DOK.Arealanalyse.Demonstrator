import { Heading } from '@digdir/designsystemet-react';
import DataNode from './DataNode';
import styles from './Data.module.scss';

export default function Data({ dataList }) {
    return (
        <>
            <Heading level={3}>Data</Heading>

            <div className={styles.dataList}>
                {
                    dataList.map((data, i) => (
                        <div key={i} className={styles.data}>
                            <DataNode key={i} data={data} />
                        </div>
                    ))
                }
            </div>
        </>
    );
}