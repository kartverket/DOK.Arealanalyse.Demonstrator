import { useState } from 'react';
import RcDrawer from 'rc-drawer';
import { Button } from '@digdir/designsystemet-react';
import { motionProps } from './helpers';

export default function Drawer() {
    const [open, setOpen] = useState(false)

    return (
        <RcDrawer
            open={open}
            placement="right"
            width="50%"
            {...motionProps}
        >
            <h1>Test</h1>
            <Button onClick={() => setOpen(false)}>Lukk</Button>
        </RcDrawer>
    );
}