import { Shape } from '../../@types';

export type SelectionState = {
    selection: SelectionItem | null;
};

export type SelectionItem = {
    location: number;
    rects: Array<Shape>;
};
