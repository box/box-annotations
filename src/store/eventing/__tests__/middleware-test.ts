import getEventingMiddleware, { eventHandlers } from '../middleware';
import {
    applySidebarAnnotationUpdateAction,
    applySidebarReplyCreateAction,
    applySidebarReplyDeleteAction,
    applySidebarReplyUpdateAction,
    createAnnotationAction,
    createReplyAction,
    deleteAnnotationAction,
    deleteReplyAction,
    updateAnnotationAction,
    updateReplyAction,
} from '../../annotations/actions';

describe('store/eventing/middleware', () => {
    describe('getEventingMiddleware()', () => {
        const mockHandler = jest.fn();
        const customEventHandlers = {
            foo: mockHandler,
        };
        const middleware = getEventingMiddleware(customEventHandlers);
        const next = jest.fn();
        const store = {
            dispatch: jest.fn(),
            getState: jest.fn(),
        };

        test('should use provided eventHandlers', () => {
            middleware(store)(next)({ type: 'foo' });

            expect(next).toHaveBeenCalled();
            expect(store.getState).toHaveBeenCalledTimes(2);
            expect(mockHandler).toHaveBeenCalled();
        });

        test('should not call handlers if action type does not match', () => {
            middleware(store)(next)({ type: 'bar' });

            expect(next).toHaveBeenCalled();
            expect(store.getState).toHaveBeenCalledTimes(2);
            expect(mockHandler).not.toHaveBeenCalled();
        });
    });

    describe('eventHandlers registration', () => {
        test.each([
            createAnnotationAction,
            createReplyAction,
            deleteAnnotationAction,
            deleteReplyAction,
            updateAnnotationAction,
            updateReplyAction,
        ])('should register fulfilled, pending, and rejected handlers for $typePrefix', thunk => {
            expect(eventHandlers).toHaveProperty(thunk.fulfilled.toString());
            expect(eventHandlers).toHaveProperty(thunk.pending.toString());
            expect(eventHandlers).toHaveProperty(thunk.rejected.toString());
        });

        test.each([
            applySidebarAnnotationUpdateAction,
            applySidebarReplyCreateAction,
            applySidebarReplyDeleteAction,
            applySidebarReplyUpdateAction,
        ])('should NOT register sidebar inbound action $type in the eventing middleware', action => {
            expect(eventHandlers).not.toHaveProperty(action.toString());
        });
    });
});
