import { Rect } from '../../@types';

export type PromoterState = {
    selection: SelectionItem | null;
};

export type SelectionItem = {
    boundingRect: Rect;
    location: number;
    rects: Array<Rect>;
};
