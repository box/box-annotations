import { Shape } from '../../@types';

export type SelectionState = {
    selection: SelectionItem | null;
};

export type SelectionItem = {
    boundingRect: Shape;
    location: number;
    rects: Array<Shape>;
};
