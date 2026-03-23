import reducer from '../reducer';
import {
    setBoundingBoxHighlightsAction,
    setSelectedBoundingBoxHighlightAction,
    navigateBoundingBoxHighlightAction,
} from '../actions';
import { setViewModeAction } from '../../options/actions';
import { BoundingBox } from '../types';

describe('store/boundingBoxHighlights/reducer', () => {
    const initialState = {
        boundingBoxes: [],
        selectedId: null,
    };

    const mockBoundingBoxes: BoundingBox[] = [
        { id: 'box1', x: 10, y: 20, width: 100, height: 50, pageNumber: 1 },
        { id: 'box2', x: 30, y: 40, width: 120, height: 60, pageNumber: 1 },
        { id: 'box3', x: 50, y: 60, width: 80, height: 40, pageNumber: 2 },
    ];

    describe('initial state', () => {
        test('should return the initial state', () => {
            const state = reducer(undefined, { type: 'UNKNOWN_ACTION' });

            expect(state).toEqual(initialState);
        });
    });

    describe('setBoundingBoxHighlightsAction', () => {
        test('should set bounding boxes in state', () => {
            const newState = reducer(initialState, setBoundingBoxHighlightsAction(mockBoundingBoxes));

            expect(newState.boundingBoxes).toEqual(mockBoundingBoxes);
            expect(newState.boundingBoxes).toHaveLength(3);
            expect(newState.selectedId).toBeNull();
        });

        test('should replace existing bounding boxes and reset selected id', () => {
            const stateWithBoxes = {
                boundingBoxes: mockBoundingBoxes,
                selectedId: 'box1',
            };

            const newBoxes: BoundingBox[] = [
                { id: 'new1', x: 0, y: 0, width: 50, height: 25, pageNumber: 1 },
            ];

            const newState = reducer(stateWithBoxes, setBoundingBoxHighlightsAction(newBoxes));

            expect(newState.boundingBoxes).toEqual(newBoxes);
            expect(newState.boundingBoxes).toHaveLength(1);
            expect(newState.selectedId).toBeNull();
        });

        test('should handle empty array and reset selected id', () => {
            const stateWithBoxes = {
                boundingBoxes: mockBoundingBoxes,
                selectedId: 'box1',
            };

            const newState = reducer(stateWithBoxes, setBoundingBoxHighlightsAction([]));

            expect(newState.boundingBoxes).toEqual([]);
            expect(newState.selectedId).toBeNull();
        });
    });

    describe('setSelectedBoundingBoxHighlightAction', () => {
        test('should set selected bounding box id', () => {
            const newState = reducer(initialState, setSelectedBoundingBoxHighlightAction('box1'));

            expect(newState.selectedId).toBe('box1');
        });

        test('should update selected id when already set', () => {
            const stateWithSelection = {
                ...initialState,
                selectedId: 'box1',
            };

            const newState = reducer(stateWithSelection, setSelectedBoundingBoxHighlightAction('box2'));

            expect(newState.selectedId).toBe('box2');
        });

        test('should clear selection when passed null', () => {
            const stateWithSelection = {
                ...initialState,
                selectedId: 'box1',
            };

            const newState = reducer(stateWithSelection, setSelectedBoundingBoxHighlightAction(null));

            expect(newState.selectedId).toBeNull();
        });
    });

    describe('navigateBoundingBoxHighlightAction', () => {
        test('should set selected id when navigating', () => {
            const newState = reducer(initialState, navigateBoundingBoxHighlightAction('box2'));

            expect(newState.selectedId).toBe('box2');
        });

        test('should update selected id during navigation', () => {
            const stateWithSelection = {
                ...initialState,
                selectedId: 'box1',
            };

            const newState = reducer(stateWithSelection, navigateBoundingBoxHighlightAction('box3'));

            expect(newState.selectedId).toBe('box3');
        });
    });

    describe('setViewModeAction', () => {
        test('should clear selected id when switching to annotations mode', () => {
            const stateWithSelection = {
                ...initialState,
                boundingBoxes: mockBoundingBoxes,
                selectedId: 'box2',
            };

            const newState = reducer(stateWithSelection, setViewModeAction('annotations'));

            expect(newState.selectedId).toBeNull();
            expect(newState.boundingBoxes).toEqual(mockBoundingBoxes); // Should not clear boxes
        });

        test('should not clear selected id when switching to boundingBoxes mode', () => {
            const stateWithSelection = {
                ...initialState,
                boundingBoxes: mockBoundingBoxes,
                selectedId: 'box2',
            };

            const newState = reducer(stateWithSelection, setViewModeAction('boundingBoxes'));

            expect(newState.selectedId).toBe('box2'); // Should remain selected
        });

        test('should handle clearing when selectedId is already null', () => {
            const stateWithoutSelection = {
                ...initialState,
                boundingBoxes: mockBoundingBoxes,
                selectedId: null,
            };

            const newState = reducer(stateWithoutSelection, setViewModeAction('annotations'));

            expect(newState.selectedId).toBeNull();
        });
    });
});
