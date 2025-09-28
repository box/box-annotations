import {pageCreatorState, videoCreatorState} from '../__mocks__/creatorState';
import { CreatorStatus } from '../types';
import {
    getCreatorMessage,
    getCreatorReferenceId,
    getCreatorStaged,
    getCreatorStagedForLocation,
    getCreatorStatus,
} from '../selectors';

describe('store/annotations/selectors', () => {
    const state = { creator: pageCreatorState };
    const videoState = { creator: videoCreatorState };

    describe('getCreatorStatus', () => {
        test('should return the current creator status', () => {
            expect(getCreatorStatus(state)).toBe(CreatorStatus.init);
        });
    });

    describe('getCreatorReferenceId', () => {
        test('should return the current creator reference id', () => {
            expect(getCreatorReferenceId(state)).toEqual('100001');
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
                  "targetType": "page",
                  "type": "region",
                }
            `);
        });

        test('should return the current creator staged item for video content', () => {
            expect(getCreatorStaged(videoState)).toMatchInlineSnapshot(`
                Object {
                  "location": 120,
                  "shape": Object {
                    "height": 100,
                    "type": "rect",
                    "width": 100,
                    "x": 10,
                    "y": 10,
                  },
                  "targetType": "frame",
                  "type": "region",
                }
            `);
        });
    });

    describe('getCreatorStagedForLocation', () => {
        test('should return all annotations for a given location', () => {
            expect(getCreatorStagedForLocation(state, 1)).toMatchObject({
                location: 1,
                shape: {
                    height: 100,
                    type: 'rect',
                    width: 100,
                    x: 10,
                    y: 10,
                },
                type: 'region',
            });
            expect(getCreatorStagedForLocation(state, 2)).toEqual(null);
        });

        test('should return the current creator staged item for video content', () => {
            expect(getCreatorStagedForLocation(videoState, -1)).toMatchObject({
                location: 120,
                shape: {
                    height: 100,
                    type: 'rect',
                    width: 100,
                    x: 10,
                    y: 10,
                },
                type: 'region',
            });

            expect(getCreatorStagedForLocation(videoState, 1)).toEqual(null);
        });
    });

    describe('getCreatorMessage', () => {
        test('should return creator message', () => {
            expect(getCreatorMessage(state)).toEqual('test');
        });
    });
});
