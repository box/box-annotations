import { Action } from '@reduxjs/toolkit';
import {
    handleReplyDeleteErrorEvents,
    handleReplyDeletePendingEvents,
    handleReplyDeleteSuccessEvents,
} from '../replyDelete';
import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';

jest.mock('../../../common/EventManager');

describe('store/eventing/replyDelete', () => {
    const prevState = {} as AppState;
    const nextState = {} as AppState;

    const arg = { annotationId: 'anno_1', replyId: 'reply_1' };
    const action = {
        type: 'action',
        meta: { arg, requestId: '123' },
    } as Action;

    describe('handleReplyDeleteErrorEvents()', () => {
        const error = new Error('foo');
        const actionWithError = { ...action, error } as Action;

        test('should emit reply delete event with error status and arg-derived ids', () => {
            handleReplyDeleteErrorEvents(prevState, nextState, actionWithError);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_delete', {
                annotation: { id: 'anno_1' },
                annotationReply: { id: 'reply_1' },
                error,
                meta: { requestId: '123', status: 'error' },
            });
        });
    });

    describe('handleReplyDeletePendingEvents()', () => {
        test('should emit reply delete event with pending status and arg-derived ids', () => {
            handleReplyDeletePendingEvents(prevState, nextState, action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_delete', {
                annotation: { id: 'anno_1' },
                annotationReply: { id: 'reply_1' },
                meta: { requestId: '123', status: 'pending' },
            });
        });
    });

    describe('handleReplyDeleteSuccessEvents()', () => {
        test('should emit reply delete event with success status and payload-derived ids', () => {
            const actionWithPayload = { ...action, payload: { annotationId: 'anno_1', replyId: 'reply_1' } };
            handleReplyDeleteSuccessEvents(prevState, nextState, actionWithPayload);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_delete', {
                annotation: { id: 'anno_1' },
                annotationReply: { id: 'reply_1' },
                meta: { requestId: '123', status: 'success' },
            });
        });

        test('should not emit when success arrives with no payload', () => {
            handleReplyDeleteSuccessEvents(prevState, nextState, action);

            expect(eventManager.emit).not.toHaveBeenCalled();
        });
    });
});
