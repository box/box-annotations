import { Action } from '@reduxjs/toolkit';
import { handleDeleteErrorEvents, handleDeletePendingEvents, handleDeleteSuccessEvents } from '../delete';
import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';

jest.mock('../../../common/EventManager');

describe('store/eventing/delete', () => {
    const prevState = {} as AppState;
    const nextState = {} as AppState;

    const arg = 'anno_1';
    const action = {
        type: 'action',
        meta: { arg, requestId: '123' },
    } as Action;

    describe('handleDeleteErrorEvents()', () => {
        const error = new Error('foo');
        const actionWithError = { ...action, error } as Action;

        test('should emit delete event with error status and arg id', () => {
            handleDeleteErrorEvents(prevState, nextState, actionWithError);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_delete', {
                annotation: { id: 'anno_1' },
                error,
                meta: { requestId: '123', status: 'error' },
            });
        });
    });

    describe('handleDeletePendingEvents()', () => {
        test('should emit delete event with pending status and arg id', () => {
            handleDeletePendingEvents(prevState, nextState, action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_delete', {
                annotation: { id: 'anno_1' },
                meta: { requestId: '123', status: 'pending' },
            });
        });

        test('should emit with undefined annotation and requestId when meta is missing', () => {
            handleDeletePendingEvents(prevState, nextState, { type: 'action' } as Action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_delete', {
                annotation: undefined,
                meta: { requestId: undefined, status: 'pending' },
            });
        });
    });

    describe('handleDeleteSuccessEvents()', () => {
        test('should emit delete event with success status and payload id', () => {
            const actionWithPayload = { ...action, payload: 'anno_1' };
            handleDeleteSuccessEvents(prevState, nextState, actionWithPayload);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_delete', {
                annotation: { id: 'anno_1' },
                meta: { requestId: '123', status: 'success' },
            });
        });

        test('should not emit when success arrives with no payload', () => {
            handleDeleteSuccessEvents(prevState, nextState, action);

            expect(eventManager.emit).not.toHaveBeenCalled();
        });
    });
});
