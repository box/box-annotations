import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';
import { getStatus, getType, handleSetStagedAction, handleResetCreatorAction } from '../staged';
import { createStore } from '../..';
import { CreatorItemHighlight, CreatorItemRegion, CreatorState } from '../../creator';
import { Event } from '../../../@types';

jest.mock('../../../common/EventManager');

describe('store/eventing/staged', () => {
    const getStagedHighlight = (): CreatorItemHighlight => ({
        location: 1,
        shapes: [
            {
                type: 'rect',
                height: 50,
                width: 50,
                x: 10,
                y: 10,
            },
        ],
    });

    const getStagedRegion = (): CreatorItemRegion => ({
        location: 1,
        shape: {
            type: 'rect',
            height: 50,
            width: 50,
            x: 10,
            y: 10,
        },
    });

    const getCreatorHighlight = (): CreatorState =>
        ({
            staged: getStagedHighlight(),
        } as CreatorState);

    const getCreatorRegion = (): CreatorState =>
        ({
            staged: getStagedRegion(),
        } as CreatorState);

    const getCreatorState = (isHighlight = true): AppState => {
        const creator = isHighlight ? getCreatorHighlight() : getCreatorRegion();
        return createStore({ creator }).getState();
    };

    describe('getStatus()', () => {
        test.each`
            prev         | next         | expectedStatus
            ${null}      | ${null}      | ${null}
            ${null}      | ${'notnull'} | ${'create'}
            ${'notnull'} | ${null}      | ${'cancel'}
            ${'notnull'} | ${'notnull'} | ${'update'}
        `(
            'should return $expectedStatus if prevStaged=$prev and nextStaged=$next',
            ({ prev, next, expectedStatus }) => {
                expect(getStatus(prev, next)).toBe(expectedStatus);
            },
        );
    });

    describe('getType()', () => {
        test.each`
            staged                  | expectedType
            ${null}                 | ${null}
            ${getStagedHighlight()} | ${'highlight'}
            ${getStagedRegion()}    | ${'region'}
        `('should returned $expectedType if staged=$staged', ({ staged, expectedType }) => {
            expect(getType(staged)).toBe(expectedType);
        });
    });

    describe('handleSetStagedAction()', () => {
        test('should not emit event if status or type is null', () => {
            handleSetStagedAction(createStore().getState(), createStore().getState());

            expect(eventManager.emit).not.toHaveBeenCalled();
        });

        test.each`
            prev                        | next                      | type           | status
            ${createStore().getState()} | ${getCreatorState()}      | ${'highlight'} | ${'create'}
            ${createStore().getState()} | ${getCreatorState(false)} | ${'region'}    | ${'create'}
            ${getCreatorState(false)}   | ${getCreatorState(false)} | ${'region'}    | ${'update'}
        `('should emit event with type=$type and status=$status', ({ prev, next, type, status }) => {
            handleSetStagedAction(prev, next);

            expect(eventManager.emit).toHaveBeenCalledWith(Event.CREATOR_STAGED_CHANGE, { type, status });
        });
    });

    describe('handleResetCreatorAction()', () => {
        test('should not emit event if type is null', () => {
            const prevState = createStore().getState();
            handleResetCreatorAction(prevState);

            expect(eventManager.emit).not.toHaveBeenCalled();
        });

        test.each`
            prev                      | type
            ${getCreatorState()}      | ${'highlight'}
            ${getCreatorState(false)} | ${'region'}
        `('should emit cancel event if with type=$type', ({ prev, type }) => {
            handleResetCreatorAction(prev);

            expect(eventManager.emit).toHaveBeenCalledWith(Event.CREATOR_STAGED_CHANGE, { type, status: 'cancel' });
        });
    });
});
