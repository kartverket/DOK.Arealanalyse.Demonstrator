import DataNode from './DataNode';
import { Heading } from '@digdir/designsystemet-react';
import styles from './Data.module.scss';

interface DataProps {
    dataList: Record<string, unknown>[];
}

export default function Data({ dataList }: DataProps) {
    return (
        <>
            <Heading level={3}>Data</Heading>

            <div className={styles.dataList}>
                {dataList.map((data, i) => (
                    <div
                        key={i}
                        className={styles.data}
                    >
                        <DataNode
                            key={i}
                            data={data}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}
