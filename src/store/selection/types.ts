export type SelectionState = {
    selection: SelectionItem | null;
};

export type SelectionItem = {
    boundingRect: Required<DOMRectInit>;
    location: number;
    rects: Array<Required<DOMRectInit>>;
};
