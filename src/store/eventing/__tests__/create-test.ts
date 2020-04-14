import { Action } from '@reduxjs/toolkit';
import { handleCreateErrorEvents, handleCreatePendingEvents, handleCreateSuccessEvents } from '../create';
import eventManager from '../../../common/EventManager';
import { ApplicationState } from '../../types';

jest.mock('../../../common/EventManager');

describe('store/eventing/create', () => {
    const prevState = {} as ApplicationState;
    const nextState = {} as ApplicationState;

    const annotation = {
        message: 'hello',
    };
    const action = {
        type: 'action',
        meta: {
            arg: annotation,
        },
    } as Action;

    describe('handleCreateErrorEvents()', () => {
        const error = new Error('foo');
        const actionWithError = { ...action, error } as Action;

        test('should emit create event with error status', () => {
            handleCreateErrorEvents(prevState, nextState, actionWithError);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotationCreate', {
                annotation,
                error,
                meta: {
                    status: 'error',
                },
            });
        });
    });

    describe('handleCreatePendingEvents()', () => {
        test('should emit create event with pending status', () => {
            handleCreatePendingEvents(prevState, nextState, action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotationCreate', {
                annotation,
                meta: {
                    status: 'pending',
                },
            });
        });
    });

    describe('handleCreateSuccessEvents()', () => {
        test('should emit create event with success status', () => {
            handleCreateSuccessEvents(prevState, nextState, action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotationCreate', {
                annotation,
                meta: {
                    status: 'success',
                },
            });
        });
    });
});
