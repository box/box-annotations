import highlightState from '../__mocks__/highlightState';
import { getIsPromoting, getSelection, getSelectionForLocation, getIsSelecting } from '../selectors';

describe('store/highlight/selectors', () => {
    const state = { highlight: highlightState };

    describe('getIsPromoting', () => {
        test('should return default isPromoting', () => {
            expect(getIsPromoting(state)).toBe(false);
        });
    });

    describe('getIsSelecting', () => {
        test('should return default isSelecting', () => {
            expect(getIsSelecting(state)).toBe(false);
        });
    });

    describe('getSelection', () => {
        test('should return the current selection item', () => {
            expect(getSelection(state)).toMatchInlineSnapshot(`
                Object {
                  "canCreate": true,
                  "containerRect": Object {
                    "height": 1000,
                    "width": 1000,
                    "x": 0,
                    "y": 0,
                  },
                  "location": 1,
                  "rects": Array [
                    Object {
                      "height": 100,
                      "width": 100,
                      "x": 200,
                      "y": 200,
                    },
                  ],
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
