import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';
import { getActiveAnnotationId } from '../../annotations';
import { getFileVersionId } from '../../options';
import { handleActiveAnnotationEvents } from '../active';

jest.mock('../../../common/EventManager');
jest.mock('../../annotations');
jest.mock('../../options');

describe('store/eventing/active', () => {
    beforeEach(() => {
        (getFileVersionId as jest.Mock).mockReturnValue('456');
    });

    test('should not emit event if prev and next ids are the same', () => {
        const state = {} as AppState;
        (getActiveAnnotationId as jest.Mock).mockImplementationOnce(() => '123').mockImplementationOnce(() => '123');

        handleActiveAnnotationEvents(state, state);

        expect(eventManager.emit).not.toBeCalled();
    });

    test.each`
        prevId   | nextId
        ${null}  | ${'123'}
        ${'123'} | ${'456'}
        ${'456'} | ${null}
    `('should emit evet when prevId is $prevId, nextId is $nextId', ({ prevId, nextId }) => {
        const state = {} as AppState;
        (getActiveAnnotationId as jest.Mock).mockImplementationOnce(() => prevId).mockImplementationOnce(() => nextId);

        handleActiveAnnotationEvents(state, state);

        expect(eventManager.emit).toBeCalledWith('annotations_active_change', {
            annotationId: nextId,
            fileVersionId: '456',
        });
    });
});
