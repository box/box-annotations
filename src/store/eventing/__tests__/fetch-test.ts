import eventManager from '../../../common/EventManager';
import { fetchAnnotationRepliesAction, fetchAnnotationsAction } from '../../annotations/actions';
import { eventHandlers } from '../middleware';
import { AppState } from '../../types';
import { AsyncAction } from '../types';
import { handleFetchErrorEvents } from '../fetch';

jest.mock('../../../common/EventManager');

describe('store/eventing/fetch', () => {
    test('should emit fetch error event', () => {
        const error = new Error('fetch');
        handleFetchErrorEvents({} as AppState, {} as AppState, { error } as AsyncAction);

        expect(eventManager.emit).toBeCalledWith('annotations_fetch_error', { error });
    });

    test.each([fetchAnnotationsAction, fetchAnnotationRepliesAction])(
        'should emit fetch error event when %o rejected action flows through the eventing middleware',
        thunk => {
            const error = new Error('boom');
            const rejectedType = thunk.rejected.toString();
            const handler = eventHandlers[rejectedType];

            handler({} as AppState, {} as AppState, { error, type: rejectedType } as AsyncAction);

            expect(eventManager.emit).toHaveBeenCalledWith('annotations_fetch_error', {
                error,
                type: rejectedType,
            });
        },
    );

    test('should not emit a fetch error when the rejected action was aborted', () => {
        const rejectedType = fetchAnnotationRepliesAction.rejected.toString();
        const handler = eventHandlers[rejectedType];

        handler({} as AppState, {} as AppState, {
            error: new Error('aborted'),
            meta: { aborted: true, arg: 'annotation-1', requestId: 'req-1' },
            type: rejectedType,
        } as AsyncAction);

        expect(eventManager.emit).not.toHaveBeenCalled();
    });
});
