import { handleActiveAnnotationEvents } from '../active';
import { ApplicationState } from '../../types';
import eventManager from '../../../common/EventManager';
import { getActiveAnnotationId } from '../../annotations';

jest.mock('../../../common/EventManager');
jest.mock('../../annotations', () => ({
    getActiveAnnotationId: jest.fn(),
}));

describe('store/eventing/active', () => {
    test.each`
        prevId   | nextId   | isEventEmitted
        ${null}  | ${'123'} | ${true}
        ${'123'} | ${'123'} | ${false}
        ${'123'} | ${'456'} | ${true}
        ${'456'} | ${null}  | ${true}
    `(
        'should event be emitted when prevId is $prevId, nextId is $nextId? $isEventEmitted',
        ({ prevId, nextId, isEventEmitted }) => {
            const state = {} as ApplicationState;
            (getActiveAnnotationId as jest.Mock)
                .mockImplementationOnce(() => prevId)
                .mockImplementationOnce(() => nextId);

            handleActiveAnnotationEvents(state, state);

            if (isEventEmitted) {
                expect(eventManager.emit).toBeCalledWith('annotations_active_change', nextId);
            } else {
                expect(eventManager.emit).not.toBeCalled();
            }
        },
    );
});
