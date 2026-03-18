import { BoundingBox, BoundingBoxHighlightsState } from './types';

type State = { boundingBoxHighlights: BoundingBoxHighlightsState };

export const getBoundingBoxHighlights = ({ boundingBoxHighlights }: State): BoundingBox[] =>
    boundingBoxHighlights.boundingBoxes;

export const getBoundingBoxHighlightsForPage = ({ boundingBoxHighlights }: State, pageNumber: number): BoundingBox[] =>
    boundingBoxHighlights.boundingBoxes.filter(box => box.pageNumber === pageNumber);

export const getSelectedBoundingBoxHighlightId = ({ boundingBoxHighlights }: State): string | null =>
    boundingBoxHighlights.selectedId;
