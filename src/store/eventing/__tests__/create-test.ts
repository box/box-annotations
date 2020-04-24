import { Action } from '@reduxjs/toolkit';
import { handleCreateErrorEvents, handleCreatePendingEvents, handleCreateSuccessEvents } from '../create';
import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';
import { annotation as payload } from '../../../region/__mocks__/data';

jest.mock('../../../common/EventManager');

describe('store/eventing/create', () => {
    const prevState = {} as AppState;
    const nextState = {} as AppState;

    const annotation = {
        message: 'hello',
    };
    const action = {
        type: 'action',
        meta: {
            arg: annotation,
            requestId: '123',
        },
    } as Action;

    describe('handleCreateErrorEvents()', () => {
        const error = new Error('foo');
        const actionWithError = { ...action, error } as Action;

        test('should emit create event with error status', () => {
            handleCreateErrorEvents(prevState, nextState, actionWithError);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_create', {
                annotation,
                error,
                meta: {
                    requestId: '123',
                    status: 'error',
                },
            });
        });
    });

    describe('handleCreatePendingEvents()', () => {
        test('should emit create event with pending status', () => {
            handleCreatePendingEvents(prevState, nextState, action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_create', {
                annotation,
                meta: {
                    requestId: '123',
                    status: 'pending',
                },
            });
        });
    });

    describe('handleCreateSuccessEvents()', () => {
        test('should emit create event with success status', () => {
            const actionWithPayload = { ...action, payload };
            handleCreateSuccessEvents(prevState, nextState, actionWithPayload);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_create', {
                annotation: payload,
                meta: {
                    requestId: '123',
                    status: 'success',
                },
            });
        });
    });
});
