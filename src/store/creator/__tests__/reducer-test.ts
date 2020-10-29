import reducer from '../reducer';
import state from '../__mocks__/creatorState';
import { createAnnotationAction } from '../../annotations';
import { CreatorStatus } from '../types';
import { NewAnnotation } from '../../../@types';
import {
    resetCreatorAction,
    setCursorAction,
    setMessageAction,
    setReferenceIdAction,
    setStagedAction,
    setStatusAction,
} from '../actions';
import { toggleAnnotationModeAction } from '../../common';

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

    describe('setReferenceIdAction', () => {
        test('should set the reference shape in state', () => {
            const payload = '123123';
            const newState = reducer(state, setReferenceIdAction(payload));

            expect(newState.referenceId).toEqual('123123');
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

    describe('toggleAnnotationModeAction', () => {
        test('should reset the creator state', () => {
            const newState = reducer(
                {
                    ...state,
                    cursor: 1,
                    error: new Error('error'),
                    status: CreatorStatus.rejected,
                },
                toggleAnnotationModeAction,
            );

            expect(newState.cursor).toEqual(0);
            expect(newState.error).toEqual(null);
            expect(newState.message).toEqual('');
            expect(newState.staged).toEqual(null);
            expect(newState.status).toEqual(CreatorStatus.init);
        });
    });

    describe('resetCreatorAction', () => {
        test('should reset some of the creator state', () => {
            const error = new Error('error');
            const newState = reducer(
                {
                    ...state,
                    cursor: 1,
                    error,
                    referenceId: '123',
                    status: CreatorStatus.rejected,
                },
                resetCreatorAction,
            );

            expect(newState.cursor).toEqual(1);
            expect(newState.error).toEqual(error);
            expect(newState.message).toEqual('');
            expect(newState.referenceId).toEqual(null);
            expect(newState.staged).toEqual(null);
            expect(newState.status).toEqual(CreatorStatus.init);
        });
    });
});
