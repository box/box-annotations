import { Shape } from '../../@types';

export type PromoterState = {
    isPromoting: boolean;
    selection: SelectionItem | null;
};

export type SelectionItem = {
    location: number;
    rects: Array<Shape>;
};
