import {
    getBoundingBoxHighlights,
    getBoundingBoxHighlightsForPage,
    getSelectedBoundingBoxHighlightId,
} from '../selectors';
import { BoundingBox, BoundingBoxHighlightsState } from '../types';

describe('store/boundingBoxHighlights/selectors', () => {
    const mockBoundingBoxes: BoundingBox[] = [
        { id: 'box1', x: 10, y: 20, width: 100, height: 50, pageNumber: 1 },
        { id: 'box2', x: 30, y: 40, width: 120, height: 60, pageNumber: 1 },
        { id: 'box3', x: 50, y: 60, width: 80, height: 40, pageNumber: 2 },
        { id: 'box4', x: 70, y: 80, width: 90, height: 45, pageNumber: 3 },
    ];

    const boundingBoxHighlightsState: BoundingBoxHighlightsState = {
        boundingBoxes: mockBoundingBoxes,
        selectedId: 'box2',
    };

    const state = { boundingBoxHighlights: boundingBoxHighlightsState };

    describe('getBoundingBoxHighlights', () => {
        test('should return all bounding boxes', () => {
            const result = getBoundingBoxHighlights(state);

            expect(result).toEqual(mockBoundingBoxes);
            expect(result).toHaveLength(4);
        });

        test('should return empty array when no bounding boxes', () => {
            const emptyState = {
                boundingBoxHighlights: {
                    boundingBoxes: [],
                    selectedId: null,
                },
            };

            const result = getBoundingBoxHighlights(emptyState);

            expect(result).toEqual([]);
        });
    });

    describe('getBoundingBoxHighlightsForPage', () => {
        test('should return bounding boxes for page 1', () => {
            const result = getBoundingBoxHighlightsForPage(state, 1);

            expect(result).toHaveLength(2);
            expect(result).toEqual([
                { id: 'box1', x: 10, y: 20, width: 100, height: 50, pageNumber: 1 },
                { id: 'box2', x: 30, y: 40, width: 120, height: 60, pageNumber: 1 },
            ]);
        });

        test('should return bounding boxes for page 2', () => {
            const result = getBoundingBoxHighlightsForPage(state, 2);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: 'box3',
                x: 50,
                y: 60,
                width: 80,
                height: 40,
                pageNumber: 2,
            });
        });

        test('should return bounding boxes for page 3', () => {
            const result = getBoundingBoxHighlightsForPage(state, 3);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('box4');
        });

        test('should return empty array for page with no bounding boxes', () => {
            const result = getBoundingBoxHighlightsForPage(state, 99);

            expect(result).toEqual([]);
        });

        test('should handle empty bounding boxes array', () => {
            const emptyState = {
                boundingBoxHighlights: {
                    boundingBoxes: [],
                    selectedId: null,
                },
            };

            const result = getBoundingBoxHighlightsForPage(emptyState, 1);

            expect(result).toEqual([]);
        });
    });

    describe('getSelectedBoundingBoxHighlightId', () => {
        test('should return selected bounding box id', () => {
            const result = getSelectedBoundingBoxHighlightId(state);

            expect(result).toBe('box2');
        });

        test('should return null when no selection', () => {
            const stateWithoutSelection = {
                boundingBoxHighlights: {
                    boundingBoxes: mockBoundingBoxes,
                    selectedId: null,
                },
            };

            const result = getSelectedBoundingBoxHighlightId(stateWithoutSelection);

            expect(result).toBeNull();
        });
    });
});
