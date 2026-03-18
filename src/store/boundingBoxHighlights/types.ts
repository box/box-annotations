export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
    id: string;
}

export interface BoundingBoxHighlightsState {
    boundingBoxes: BoundingBox[];
    selectedId: string | null;
}
