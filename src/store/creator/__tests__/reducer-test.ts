import reducer from '../reducer';
import state from '../__mocks__/creatorState';
import { createAnnotationAction } from '../../annotations';
import { CreatorStatus } from '../types';
import { NewAnnotation } from '../../../@types';
import { setCursorAction, setMessageAction, setSelectionAction, setStagedAction, setStatusAction } from '../actions';

describe('store/creator/reducer', () => {
    describe('createAnnotationAction', () => {
        test('should set state when fulfilled', () => {
            const newState = reducer(
                {
                    ...state,
                    cursor: 1,
                    error: new Error('error'),
                    status: CreatorStatus.rejected,
                },
                createAnnotationAction.fulfilled,
            );

            expect(newState.cursor).toEqual(0);
            expect(newState.error).toEqual(null);
            expect(newState.message).toEqual('');
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

    describe('setSelection', () => {
        test('should set selection in state', () => {
            const payload = { ...state.selection, location: 2 };
            const newState = reducer(state, setSelectionAction(payload));

            expect(newState.selection).toEqual(payload);
        });
    });
});
