// ol-ext har ingen egne typer, så bare det som brukes i redigeringen av analyseområdet er tatt med

declare module 'ol-ext/interaction/DrawHole' {
    import Draw from 'ol/interaction/Draw';

    import type Layer from 'ol/layer/Layer';
    import type { StyleLike } from 'ol/style/Style';

    export interface Options {
        layers?: Layer[] | ((layer: Layer) => boolean);
        style?: StyleLike;
    }

    export default class DrawHole extends Draw {
        constructor(options?: Options);
    }
}

declare module 'ol-ext/interaction/ModifyFeature' {
    import PointerInteraction from 'ol/interaction/Pointer';

    import type VectorSource from 'ol/source/Vector';
    import type { StyleLike } from 'ol/style/Style';

    export interface Options {
        source?: VectorSource;
        pixelTolerance?: number;
        style?: StyleLike;
    }

    export default class ModifyFeature extends PointerInteraction {
        constructor(options?: Options);
    }
}

declare module 'ol-ext/interaction/UndoRedo' {
    import Interaction from 'ol/interaction/Interaction';

    import type { EventsKey } from 'ol/events';
    import type BaseEvent from 'ol/events/Event';
    import type Layer from 'ol/layer/Layer';

    type StackEventType = 'stack:add' | 'stack:remove' | 'stack:clear';

    export interface Options {
        maxLength?: number;
        layers?: Layer[];
    }

    export default class UndoRedo extends Interaction {
        constructor(options?: Options);

        on: Interaction['on'] &
            ((
                type: StackEventType | StackEventType[],
                listener: (event: BaseEvent) => unknown,
            ) => EventsKey | EventsKey[]);

        define<TProp>(
            action: string,
            undoFn: (prop: TProp) => void,
            redoFn: (prop: TProp) => void,
        ): void;

        push(action: string, prop: unknown, name?: string): boolean;

        undo(): void;

        redo(): void;

        clear(): void;

        length(type?: 'undo' | 'redo'): number;
    }
}
