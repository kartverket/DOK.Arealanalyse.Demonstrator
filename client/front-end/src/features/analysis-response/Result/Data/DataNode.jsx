import DataValue from './DataValue';
import styles from './Data.module.scss';

const INDENT_PX = 16;

export default function DataNode({ data, level = 0, label = null }) {
    const indent = ((level - 1) * INDENT_PX);

    if (data === null || typeof data !== 'object') {
        return (
            <div className={styles.row}>
                <div className={styles.label} style={{ marginLeft: indent }}>{label}</div>
                <div className={styles.value}>
                    <DataValue value={data} />
                </div>
            </div>
        );
    }

    if (Array.isArray(data)) {
        return (
            <div>
                {label && (
                    <div
                        className={styles.label}
                        style={{ marginLeft: indent }}
                    >
                        {label}
                    </div>
                )}

                {data.map((item, index) => (
                    <DataNode
                        key={index}
                        data={item}
                        level={level + 1}
                        label={`[${index}]`}
                    />
                ))}
            </div>
        );
    }

    return (
        <div>
            {label && (
                <div
                    className={styles.label}
                    style={{ marginLeft: indent }}
                >
                    {label}
                </div>
            )}

            {Object.entries(data).map(([key, value]) => (
                <DataNode
                    key={key}
                    data={value}
                    level={level + 1}
                    label={key}
                />
            ))}
        </div>
    );
}