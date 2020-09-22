import { Shape } from '../../@types';

export type HighlightState = {
    isPromoting: boolean;
    isSelecting: boolean;
    selection: SelectionItem | null;
};

export type SelectionItem = {
    canCreate: boolean;
    containerRect: Shape;
    location: number;
    rects: Array<Shape>;
};
