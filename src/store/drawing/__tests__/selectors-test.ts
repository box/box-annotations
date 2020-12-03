import drawingState from '../__mocks__/drawingState';
import { annotations } from '../../../drawing/__mocks__/drawingData';
import { getDrawingDrawnPathGroupsForLocation } from '../selectors';

const {
    target: { path_groups: pathGroups },
} = annotations[0];

describe('store/drawing/selectors', () => {
    const state = { drawing: { ...drawingState, drawnPathGroups: pathGroups } };

    describe('getDrawingDrawnPathGroupsForLocation()', () => {
        test('should return the current drawn path groups if the location matches', () => {
            expect(getDrawingDrawnPathGroupsForLocation(state, 0)).toEqual(pathGroups);
        });

        test('should return an empty array if the location does not match', () => {
            expect(getDrawingDrawnPathGroupsForLocation(state, 1)).toEqual([]);
        });
    });
});
