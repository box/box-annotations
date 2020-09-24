import { Shape } from '../../@types';

export type HighlightState = {
    isPromoting: boolean;
    isSelecting: boolean;
    selection: SelectionItem | null;
};

export type SelectionItem = {
    containerRect: Shape;
    hasError?: boolean;
    location: number;
    rects: Array<Shape>;
};
