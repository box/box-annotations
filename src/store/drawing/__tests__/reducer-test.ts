import {
    addDrawingPathGroupAction,
    redoDrawingPathGroupAction,
    resetDrawingAction,
    setDrawingLocationAction,
    undoDrawingPathGroupAction,
} from '../actions';
import reducer, { initialState } from '../reducer';
import state from '../__mocks__/drawingState';
import { createAnnotationAction } from '../../annotations';
import { Mode, toggleAnnotationModeAction } from '../../common';
import { pathGroups } from '../../../drawing/__mocks__/drawingData';
import { resetCreatorAction } from '../../creator';

const [pathGroup1, pathGroup2] = pathGroups;

describe('store/drawing/reducer', () => {
    describe('addDrawingPathGroupAction', () => {
        test('should add path group to the existing state', () => {
            const newState = reducer(state, addDrawingPathGroupAction(pathGroup1));

            expect(newState.drawnPathGroups).toHaveLength(1);
            expect(newState.drawnPathGroups[0]).toMatchObject(pathGroup1);
        });
    });

    describe('setDrawingLocationAction', () => {
        test('should do nothing if location is the same', () => {
            const newState = reducer(state, setDrawingLocationAction(0));

            expect(newState.location).toBe(0);
        });

        test('should reset drawnPathGroups if location is the different', () => {
            const newState = reducer({ ...state, drawnPathGroups: [pathGroup1] }, setDrawingLocationAction(1));

            expect(newState).toMatchObject({
                drawnPathGroups: [],
                location: 1,
            });
        });
    });

    describe('toggleAnnotationModeAction', () => {
        test('should reset to initial state', () => {
            const newState = reducer(
                { location: 1, drawnPathGroups: [pathGroup1], stashedPathGroups: [pathGroup2] },
                toggleAnnotationModeAction(Mode.DRAWING),
            );

            expect(newState).toMatchObject(initialState);
        });
    });

    describe('resetCreatorAction', () => {
        test('should reset to initial state', () => {
            const newState = reducer(
                { location: 1, drawnPathGroups: [pathGroup1], stashedPathGroups: [pathGroup2] },
                resetCreatorAction(),
            );

            expect(newState).toMatchObject(initialState);
        });
    });

    describe('resetDrawingAction', () => {
        test('should reset to initial state', () => {
            const newState = reducer(
                { location: 1, drawnPathGroups: [pathGroup1], stashedPathGroups: [pathGroup2] },
                resetDrawingAction(),
            );

            expect(newState).toMatchObject(initialState);
        });
    });

    describe('createAnnotationAction.fulfilled', () => {
        test('should reset to initial state', () => {
            const newState = reducer(
                { location: 1, drawnPathGroups: [pathGroup1], stashedPathGroups: [pathGroup2] },
                createAnnotationAction.fulfilled,
            );

            expect(newState).toMatchObject(initialState);
        });
    });

    describe('redoDrawingPathGroupAction', () => {
        test('should do nothing if stashedPathGroups is empty', () => {
            const newState = reducer(
                { location: 1, drawnPathGroups: [pathGroup1], stashedPathGroups: [] },
                redoDrawingPathGroupAction(),
            );

            expect(newState).toMatchObject({
                drawnPathGroups: [pathGroup1],
                location: 1,
                stashedPathGroups: [],
            });
        });

        test('should pop from stashedPathGroups and push onto drawnPathGroups', () => {
            const newState = reducer(
                { location: 1, drawnPathGroups: [pathGroup1], stashedPathGroups: [pathGroup2] },
                redoDrawingPathGroupAction(),
            );

            expect(newState).toMatchObject({
                drawnPathGroups: [pathGroup1, pathGroup2],
                location: 1,
                stashedPathGroups: [],
            });
        });
    });

    describe('undoDrawingPathGroupAction', () => {
        test('should do nothing if drawnPathGroups is empty', () => {
            const newState = reducer(
                { location: 1, drawnPathGroups: [], stashedPathGroups: [] },
                undoDrawingPathGroupAction(),
            );

            expect(newState).toMatchObject({
                drawnPathGroups: [],
                location: 1,
                stashedPathGroups: [],
            });
        });

        test('should pop from drawnPathGroups and push onto stashedPathGroups', () => {
            const newState = reducer(
                { location: 1, drawnPathGroups: [pathGroup1], stashedPathGroups: [pathGroup2] },
                undoDrawingPathGroupAction(),
            );

            expect(newState).toMatchObject({
                drawnPathGroups: [],
                location: 1,
                stashedPathGroups: [pathGroup2, pathGroup1],
            });
        });
    });
});
