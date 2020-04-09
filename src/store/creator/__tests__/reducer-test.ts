import reducer from '../reducer';
import state from '../__mocks__/creatorState';
import { CreatorItem, CreatorStatus } from '../types';
import { setStaged, setStatus } from '../actions';

describe('store/creator/reducer', () => {
    describe('setStaged', () => {
        test('should set the staged item in state', () => {
            const payload = { location: 2 } as CreatorItem;
            const newState = reducer(state, setStaged(payload));

            expect(newState.staged).toEqual(payload);
        });
    });

    describe('setStatus', () => {
        test('should set the creator status in state', () => {
            const payload = CreatorStatus.ready;
            const newState = reducer(state, setStatus(payload));

            expect(newState.status).toEqual(CreatorStatus.ready);
        });
    });
});
