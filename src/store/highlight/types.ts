import { Shape } from '../../@types';

export type HighlightState = {
    isPromoting: boolean;
    selection: SelectionItem | null;
};

export type SelectionItem = {
    containerRect: Shape;
    location: number;
    rects: Array<Shape>;
};
