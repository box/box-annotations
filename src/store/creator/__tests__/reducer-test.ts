import { NewAnnotation } from '../../../@types';
import { createAnnotationAction } from '../../annotations';
import reducer from '../reducer';
import state from '../__mocks__/creatorState';
import { CreatorStatus } from '../types';
import { setMessageAction, setCursorAction, setStagedAction, setStatusAction, updateStagedAction } from '../actions';

describe('store/creator/reducer', () => {
    describe('createAnnotationAction', () => {
        test('should set state when fulfilled', () => {
            const newState = reducer(state, createAnnotationAction.fulfilled);

            expect(newState.error).toEqual(null);
            expect(newState.staged).toEqual(null);
            expect(newState.status).toEqual(CreatorStatus.init);
        });

        test('should set state when pending', () => {
            const newState = reducer(state, createAnnotationAction.pending);

            expect(newState.error).toEqual(null);
            expect(newState.status).toEqual(CreatorStatus.pending);
        });

        test('should set state when rejected', () => {
            const arg = { target: {} } as NewAnnotation;
            const error = { message: 'This is an error', name: 'Error' };
            const newState = reducer(state, createAnnotationAction.rejected(error, 'error', arg));

            expect(newState.error).toEqual(error);
            expect(newState.status).toEqual(CreatorStatus.rejected);
        });
    });

    describe('setMessageAction', () => {
        test('should set the message in state', () => {
            const payload = 'message';
            const newState = reducer(state, setMessageAction(payload));

            expect(newState.message).toEqual(payload);
        });
    });

    describe('setStagedAction', () => {
        test('should set the staged item in state', () => {
            const payload = { ...state.staged, location: 2 };
            const newState = reducer(state, setStagedAction(payload));

            expect(newState.staged).toEqual(payload);
        });
    });

    describe('setStatusAction', () => {
        test('should set the creator status in state', () => {
            const newState = reducer(state, setStatusAction(CreatorStatus.staged));

            expect(newState.status).toEqual(CreatorStatus.staged);
        });
    });

    describe('setStagedCursorAction', () => {
        test('should set the cursor in state', () => {
            const newState = reducer(state, setCursorAction(2));

            expect(newState.cursor).toEqual(2);
        });
    });

    describe('updateStagedAction', () => {
        test('should update the staged item in state', () => {
            const payload = { location: 2 };
            const newState = reducer(state, updateStagedAction(payload));

            expect(newState.staged).toEqual({ ...state.staged, location: 2 });
        });
    });
});
