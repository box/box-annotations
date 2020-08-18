import { DOMRectMini } from '../../@types';

export type SelectionState = {
    selection: SelectionItem | null;
};

export type SelectionItem = {
    boundingRect: DOMRectInit;
    location: number;
    rects: Array<DOMRectMini>;
};
