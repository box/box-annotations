import {
    setBoundingBoxHighlightsAction,
    setSelectedBoundingBoxHighlightAction,
    navigateBoundingBoxHighlightAction,
} from '../actions';
import { BoundingBox } from '../types';

describe('store/boundingBoxHighlights/actions', () => {
    describe('setBoundingBoxHighlightsAction', () => {
        test('should create action with bounding boxes payload', () => {
            const boundingBoxes: BoundingBox[] = [
                { id: '1', x: 10, y: 20, width: 100, height: 50, pageNumber: 1 },
                { id: '2', x: 30, y: 40, width: 120, height: 60, pageNumber: 2 },
            ];

            const action = setBoundingBoxHighlightsAction(boundingBoxes);

            expect(action.type).toBe('SET_BOUNDING_BOX_HIGHLIGHTS');
            expect(action.payload).toEqual(boundingBoxes);
        });

        test('should create action with empty array', () => {
            const action = setBoundingBoxHighlightsAction([]);

            expect(action.type).toBe('SET_BOUNDING_BOX_HIGHLIGHTS');
            expect(action.payload).toEqual([]);
        });
    });

    describe('setSelectedBoundingBoxHighlightAction', () => {
        test('should create action with highlight id', () => {
            const action = setSelectedBoundingBoxHighlightAction('highlight-123');

            expect(action.type).toBe('SET_SELECTED_BOUNDING_BOX_HIGHLIGHT');
            expect(action.payload).toBe('highlight-123');
        });

        test('should create action with null to deselect', () => {
            const action = setSelectedBoundingBoxHighlightAction(null);

            expect(action.type).toBe('SET_SELECTED_BOUNDING_BOX_HIGHLIGHT');
            expect(action.payload).toBeNull();
        });
    });

    describe('navigateBoundingBoxHighlightAction', () => {
        test('should create action with highlight id', () => {
            const action = navigateBoundingBoxHighlightAction('highlight-456');

            expect(action.type).toBe('NAVIGATE_BOUNDING_BOX_HIGHLIGHT');
            expect(action.payload).toBe('highlight-456');
        });
    });
});
