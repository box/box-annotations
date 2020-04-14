import getEventingMiddleware from '../middleware';

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
});
