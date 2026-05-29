import { Action } from '@reduxjs/toolkit';
import { handleUpdateErrorEvents, handleUpdatePendingEvents, handleUpdateSuccessEvents } from '../update';
import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';
import { annotation as payload } from '../../../region/__mocks__/data';

jest.mock('../../../common/EventManager');

describe('store/eventing/update', () => {
    const prevState = {} as AppState;
    const nextState = {} as AppState;

    const arg = { annotationId: 'anno_1', payload: { message: 'updated' } };
    const action = {
        type: 'action',
        meta: { arg, requestId: '123' },
    } as Action;

    describe('handleUpdateErrorEvents()', () => {
        const error = new Error('foo');
        const actionWithError = { ...action, error } as Action;

        test('should emit update event with error status and arg-derived id', () => {
            handleUpdateErrorEvents(prevState, nextState, actionWithError);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_update', {
                annotation: { id: 'anno_1' },
                error,
                meta: { requestId: '123', status: 'error' },
            });
        });
    });

    describe('handleUpdatePendingEvents()', () => {
        test('should emit update event with pending status and arg-derived id', () => {
            handleUpdatePendingEvents(prevState, nextState, action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_update', {
                annotation: { id: 'anno_1' },
                meta: { requestId: '123', status: 'pending' },
            });
        });
    });

    describe('handleUpdateSuccessEvents()', () => {
        test('should emit update event with success status and full annotation payload', () => {
            const actionWithPayload = { ...action, payload };
            handleUpdateSuccessEvents(prevState, nextState, actionWithPayload);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_update', {
                annotation: payload,
                meta: { requestId: '123', status: 'success' },
            });
        });

        test('should not emit when success arrives with no payload', () => {
            handleUpdateSuccessEvents(prevState, nextState, action);

            expect(eventManager.emit).not.toHaveBeenCalled();
        });

        test.each([
            ['resolved', 'resolved'],
            ['open', 'unresolved'],
        ])('should emit update event with annotation.status=%s for %s flow', annotationStatus => {
            const resolvePayload = { ...payload, status: annotationStatus };
            const resolveArg = { annotationId: 'anno_1', payload: { status: annotationStatus } };
            const resolveAction = {
                type: 'action',
                meta: { arg: resolveArg, requestId: '123' },
                payload: resolvePayload,
            } as Action;

            handleUpdateSuccessEvents(prevState, nextState, resolveAction);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_update', {
                annotation: expect.objectContaining({ status: annotationStatus }),
                meta: { requestId: '123', status: 'success' },
            });
        });
    });
});
