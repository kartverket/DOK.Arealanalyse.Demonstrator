import { Button, Tooltip } from 'dibk-designsystemet';
import MouseArrowIcon from '@/assets/gfx/icon-mouse-arrow.svg?react';
import PolygonHoleIcon from '@/assets/gfx/icon-polygon-hole.svg?react';
import PolygonModifyIcon from '@/assets/gfx/icon-polygon-modify.svg?react';
import PolygonIcon from '@/assets/gfx/icon-polygon.svg?react';
import {
    ArrowCirclepathReverseIcon,
    ArrowRedoIcon,
    ArrowUndoIcon,
    DownloadIcon,
    TrashIcon,
} from '@navikt/aksel-icons';
import styles from './Toolbar.module.scss';

import type {
    EditorController,
    EditorHistory,
    EditorTool,
} from '../AreaEditor.interactions';
import type { ComponentType, SVGProps } from 'react';

interface ToolbarProps {
    editor: EditorController;
    activeTool: EditorTool | null;
    selected: boolean;
    hasGeometry: boolean;
    history: EditorHistory;
    onToolChange: (tool: EditorTool | null) => void;
    onDownload: () => void;
}

interface ToolButton {
    tool: EditorTool;
    title: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
    requiresGeometry: boolean;
    iconSize: number;
}

const TOOL_BUTTONS: ToolButton[] = [
    {
        tool: 'select',
        title: 'Velg polygon',
        Icon: MouseArrowIcon,
        requiresGeometry: false,
        iconSize: 19
    },
    {
        tool: 'draw',
        title: 'Tegn polygon',
        Icon: PolygonIcon,
        requiresGeometry: false,
        iconSize: 23
    },
    {
        tool: 'drawHole',
        title: 'Tegn hull',
        Icon: PolygonHoleIcon,
        requiresGeometry: true,
        iconSize: 23
    },
    {
        tool: 'modify',
        title: 'Endre polygon',
        Icon: PolygonModifyIcon,
        requiresGeometry: true,
        iconSize: 23
    },
];

export default function Toolbar({
    editor,
    activeTool,
    selected,
    hasGeometry,
    history,
    onToolChange,
    onDownload,
}: ToolbarProps) {
    function handleToolClick(tool: EditorTool) {
        onToolChange(tool !== activeTool ? tool : null);
    }

    return (
        <div className={styles.toolbar}>
            <Tooltip content="Angre">
                <Button
                    icon
                    variant="tertiary"
                    disabled={!history.canUndo}
                    onClick={editor.undo}
                >
                    <ArrowUndoIcon
                        aria-hidden
                        style={{ width: 24, height: 24 }}
                    />
                </Button>
            </Tooltip>

            <Tooltip content="Gjør om">
                <Button
                    icon
                    variant="tertiary"
                    disabled={!history.canRedo}
                    onClick={editor.redo}
                >
                    <ArrowRedoIcon
                        aria-hidden
                        style={{ width: 24, height: 24 }}
                    />
                </Button>
            </Tooltip>

            <div className={styles.separator}></div>

            {TOOL_BUTTONS.map(({ tool, title, Icon, requiresGeometry, iconSize }) => (
                <Tooltip content={title}>
                    <Button
                        key={tool}
                        icon
                        variant="tertiary"
                        aria-pressed={tool === activeTool}
                        disabled={requiresGeometry && !hasGeometry}
                        onClick={() => handleToolClick(tool)}
                        className={styles.tool}
                    >
                        <Icon
                            aria-hidden
                            style={{ width: iconSize, height: iconSize }}
                        />
                    </Button>
                </Tooltip>
            ))}

            <div className={styles.separator}></div>

            <Tooltip content="Slett valgt polygon">
                <Button
                    icon
                    variant="tertiary"
                    disabled={!selected}
                    onClick={editor.deleteSelected}
                >
                    <TrashIcon
                        aria-hidden
                        style={{ width: 24, height: 24 }}
                    />
                </Button>
            </Tooltip>

            <Tooltip content="Start på nytt">
                <Button
                    icon
                    variant="tertiary"
                    disabled={!hasGeometry}
                    onClick={editor.clear}
                >
                    <ArrowCirclepathReverseIcon
                        aria-hidden
                        style={{ width: 24, height: 24 }}
                    />
                </Button>
            </Tooltip>

            <Tooltip content="Last ned som GeoJSON">
                <Button
                    icon
                    variant="tertiary"
                    disabled={!hasGeometry}
                    onClick={onDownload}
                >
                    <DownloadIcon
                        aria-hidden
                        style={{ width: 24, height: 24 }}
                    />
                </Button>
            </Tooltip>
        </div>
    );
}
