import { Action } from '@reduxjs/toolkit';
import {
    handleReplyCreateErrorEvents,
    handleReplyCreatePendingEvents,
    handleReplyCreateSuccessEvents,
} from '../replyCreate';
import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';

jest.mock('../../../common/EventManager');

describe('store/eventing/replyCreate', () => {
    const prevState = {} as AppState;
    const nextState = {} as AppState;

    const arg = { annotationId: 'anno_1', message: 'hello' };
    const reply = { id: 'reply_1', message: 'hello' };
    const action = {
        type: 'action',
        meta: { arg, requestId: '123' },
    } as Action;

    describe('handleReplyCreateErrorEvents()', () => {
        const error = new Error('foo');
        const actionWithError = { ...action, error } as Action;

        test('should emit reply create event with error status and arg-derived annotation id', () => {
            handleReplyCreateErrorEvents(prevState, nextState, actionWithError);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_create', {
                annotation: { id: 'anno_1' },
                error,
                meta: { requestId: '123', status: 'error' },
            });
        });
    });

    describe('handleReplyCreatePendingEvents()', () => {
        test('should emit reply create event with pending status and arg-derived annotation id', () => {
            handleReplyCreatePendingEvents(prevState, nextState, action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_create', {
                annotation: { id: 'anno_1' },
                meta: { requestId: '123', status: 'pending' },
            });
        });

        test('should emit with undefined annotation, annotationReply, and requestId when meta is missing', () => {
            handleReplyCreatePendingEvents(prevState, nextState, { type: 'action' } as Action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_create', {
                annotation: undefined,
                annotationReply: undefined,
                meta: { requestId: undefined, status: 'pending' },
            });
        });
    });

    describe('handleReplyCreateSuccessEvents()', () => {
        test('should emit reply create event with success status and reply mapped to annotationReply', () => {
            const actionWithPayload = { ...action, payload: { annotationId: 'anno_1', reply } };
            handleReplyCreateSuccessEvents(prevState, nextState, actionWithPayload);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_create', {
                annotation: { id: 'anno_1' },
                annotationReply: reply,
                meta: { requestId: '123', status: 'success' },
            });
        });

        test('should not emit when success arrives with no reply payload', () => {
            handleReplyCreateSuccessEvents(prevState, nextState, action);

            expect(eventManager.emit).not.toHaveBeenCalled();
        });
    });
});
