import promoterState from '../__mocks__/promoterState';
import { getSelection, getSelectionForLocation } from '../selectors';

describe('store/promoter/selectors', () => {
    const state = { promoter: promoterState };

    describe('getSelection', () => {
        test('should return the current selection item', () => {
            expect(getSelection(state)).toMatchInlineSnapshot(`
                Object {
                  "boundingRect": Object {
                    "height": 10,
                    "type": "rect",
                    "width": 10,
                    "x": 100,
                    "y": 100,
                  },
                  "location": 1,
                  "rects": Array [
                    Object {
                      "height": 10,
                      "type": "rect",
                      "width": 10,
                      "x": 100,
                      "y": 100,
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
