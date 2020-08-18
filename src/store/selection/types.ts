export type DOMRectMini = Required<DOMRectInit>;

export type SelectionState = {
    selection: SelectionItem | null;
};

export type SelectionItem = {
    boundingRect: DOMRectMini;
    location: number;
    rects: Array<DOMRectMini>;
};
