import { Rect } from '../../@types';

export type SelectionState = {
    selection: SelectionItem | null;
};

export type SelectionItem = {
    boundingRect: Rect;
    location: number;
    rects: Array<Rect>;
};
