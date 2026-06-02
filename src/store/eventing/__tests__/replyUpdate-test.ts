import { Action } from '@reduxjs/toolkit';
import {
    handleReplyUpdateErrorEvents,
    handleReplyUpdatePendingEvents,
    handleReplyUpdateSuccessEvents,
} from '../replyUpdate';
import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';

jest.mock('../../../common/EventManager');

describe('store/eventing/replyUpdate', () => {
    const prevState = {} as AppState;
    const nextState = {} as AppState;

    const arg = { annotationId: 'anno_1', replyId: 'reply_1', payload: { message: 'updated' } };
    const reply = { id: 'reply_1', message: 'updated' };
    const action = {
        type: 'action',
        meta: { arg, requestId: '123' },
    } as Action;

    describe('handleReplyUpdateErrorEvents()', () => {
        const error = new Error('foo');
        const actionWithError = { ...action, error } as Action;

        test('should emit reply update event with error status and arg-derived ids', () => {
            handleReplyUpdateErrorEvents(prevState, nextState, actionWithError);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_update', {
                annotation: { id: 'anno_1' },
                annotationReply: { id: 'reply_1' },
                error,
                meta: { requestId: '123', status: 'error' },
            });
        });
    });

    describe('handleReplyUpdatePendingEvents()', () => {
        test('should emit reply update event with pending status and arg-derived ids', () => {
            handleReplyUpdatePendingEvents(prevState, nextState, action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_update', {
                annotation: { id: 'anno_1' },
                annotationReply: { id: 'reply_1' },
                meta: { requestId: '123', status: 'pending' },
            });
        });

        test('should emit with undefined annotation, annotationReply, and requestId when meta is missing', () => {
            handleReplyUpdatePendingEvents(prevState, nextState, { type: 'action' } as Action);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_update', {
                annotation: undefined,
                annotationReply: undefined,
                meta: { requestId: undefined, status: 'pending' },
            });
        });
    });

    describe('handleReplyUpdateSuccessEvents()', () => {
        test('should emit reply update event with success status and reply mapped to annotationReply', () => {
            const actionWithPayload = { ...action, payload: { annotationId: 'anno_1', reply } };
            handleReplyUpdateSuccessEvents(prevState, nextState, actionWithPayload);

            expect(eventManager.emit).toHaveBeenLastCalledWith('annotations_reply_update', {
                annotation: { id: 'anno_1' },
                annotationReply: reply,
                meta: { requestId: '123', status: 'success' },
            });
        });

        test('should not emit when success arrives with no reply payload', () => {
            handleReplyUpdateSuccessEvents(prevState, nextState, action);

            expect(eventManager.emit).not.toHaveBeenCalled();
        });
    });
});
