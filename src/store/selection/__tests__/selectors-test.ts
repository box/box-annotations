import selectionState from '../__mocks__/selectionState';
import { getSelection, getSelectionForLocation } from '../selectors';

describe('store/selection/selectors', () => {
    const state = { selection: selectionState };

    describe('getSelection', () => {
        test('should return the current selection item', () => {
            expect(getSelection(state)).toMatchInlineSnapshot(`
                Object {
                  "boundingRect": Object {
                    "height": 100,
                    "width": 100,
                    "x": 200,
                    "y": 200,
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
