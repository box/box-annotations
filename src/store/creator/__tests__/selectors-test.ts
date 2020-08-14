import creatorState from '../__mocks__/creatorState';
import { CreatorStatus } from '../types';
import { getCreatorMessage, getCreatorStaged, getCreatorStagedForLocation, getCreatorStatus } from '../selectors';

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
                  "target": Object {
                    "location": Object {
                      "type": "page",
                      "value": 1,
                    },
                    "shape": Object {
                      "height": 100,
                      "type": "rect",
                      "width": 100,
                      "x": 10,
                      "y": 10,
                    },
                    "type": "region",
                  },
                }
            `);
        });
    });

    describe('getCreatorStagedForLocation', () => {
        test('should return all annotations for a given location', () => {
            expect(getCreatorStagedForLocation(state, 1)).toMatchObject({
                target: {
                    location: {
                        type: 'page',
                        value: 1,
                    },
                    shape: {
                        height: 100,
                        type: 'rect',
                        width: 100,
                        x: 10,
                        y: 10,
                    },
                    type: 'region',
                },
            });
            expect(getCreatorStagedForLocation(state, 2)).toEqual(null);
        });
    });

    describe('getCreatorMessage', () => {
        test('should return creator message', () => {
            expect(getCreatorMessage(state)).toEqual('test');
        });
    });
});
