import promoterState from '../__mocks__/promoterState';
import { getIsPromoting, getSelection, getSelectionForLocation } from '../selectors';

describe('store/promoter/selectors', () => {
    const state = { promoter: promoterState };

    describe('getIsPromoting', () => {
        test('should return default isPromoting', () => {
            expect(getIsPromoting(state)).toBe(false);
        });
    });

    describe('getSelection', () => {
        test('should return the current selection item', () => {
            expect(getSelection(state)).toMatchInlineSnapshot(`
                Object {
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
