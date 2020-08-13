import creatorState from '../__mocks__/creatorState';
import { CreatorStatus } from '../types';
import {
    getCreatorMessage,
    getCreatorStaged,
    getCreatorStagedForLocation,
    getCreatorStatus,
    getSelection,
    getSelectionForLocation,
} from '../selectors';

describe('store/annotations/selectors', () => {
    const state = { creator: creatorState };

    describe('getCreatorStatus', () => {
        test('should return the current creator status', () => {
            expect(getCreatorStatus(state)).toBe(CreatorStatus.init);
        });
    });

    describe('getCreatorStaged', () => {
        test('should return the current creator staged item', () => {
            expect(getCreatorStaged(state)).toMatchInlineSnapshot(`
                Object {
                  "location": 1,
                  "shape": Object {
                    "height": 100,
                    "type": "rect",
                    "width": 100,
                    "x": 10,
                    "y": 10,
                  },
                }
            `);
        });
    });

    describe('getCreatorStagedForLocation', () => {
        test('should return all annotations for a given location', () => {
            expect(getCreatorStagedForLocation(state, 1)).toMatchObject({ location: 1 });
            expect(getCreatorStagedForLocation(state, 2)).toEqual(null);
        });
    });

    describe('getCreatorMessage', () => {
        test('should return creator message', () => {
            expect(getCreatorMessage(state)).toEqual('test');
        });
    });

    describe('getSelection', () => {
        test('should return the current selection item', () => {
            expect(getSelection(state)).toMatchInlineSnapshot(`
                Object {
                  "location": 1,
                  "rect": Object {
                    "height": 10,
                    "type": "rect",
                    "width": 10,
                    "x": 100,
                    "y": 100,
                  },
                }
            `);
        });
    });

    describe('getSelectionForLocation', () => {
        test('should return selection for a given location', () => {
            expect(getSelectionForLocation(state, 1)).toMatchObject({ location: 1 });
            expect(getSelectionForLocation(state, 2)).toEqual(null);
        });
    });
});
