import { addDrawingPathGroupAction, setDrawingLocationAction } from '../actions';
import reducer, { initialState } from '../reducer';
import state from '../__mocks__/drawingState';
import { annotations } from '../../../drawing/__mocks__/drawingData';
import { Mode, toggleAnnotationModeAction } from '../../common';

const {
    target: { path_groups: pathGroups },
} = annotations[0];

describe('store/drawing/reducer', () => {
    describe('addDrawingPathGroupAction', () => {
        test('should add path group to the existing state', () => {
            const newState = reducer(state, addDrawingPathGroupAction(pathGroups[0]));

            expect(newState.drawnPathGroups).toHaveLength(1);
            expect(newState.drawnPathGroups[0]).toMatchObject(pathGroups[0]);
        });
    });

    describe('setDrawingLocationAction', () => {
        test('should do nothing if location is the same', () => {
            const newState = reducer(state, setDrawingLocationAction(0));

            expect(newState.location).toBe(0);
        });

        test('should reset drawnPathGroups if location is the different', () => {
            const newState = reducer({ ...state, drawnPathGroups: [pathGroups[0]] }, setDrawingLocationAction(1));

            expect(newState).toMatchObject({
                drawnPathGroups: [],
                location: 1,
            });
        });
    });

    describe('toggleAnnotationModeAction', () => {
        test('should reset to initial state', () => {
            const newState = reducer(
                { location: 1, drawnPathGroups: [pathGroups[0]] },
                toggleAnnotationModeAction(Mode.DRAWING),
            );

            expect(newState).toMatchObject(initialState);
        });
    });
});
