import reducer from '../reducer';
import state from '../__mocks__/promoterState';
import { mockRange } from '../__mocks__/range';
import { setIsPromotingAction, setSelectionAction } from '../actions';

describe('store/promoter/reducer', () => {
    describe('setIsPromoting', () => {
        test('should set isPromoting in state', () => {
            const payload = true;
            const newState = reducer(state, setIsPromotingAction(payload));

            expect(newState.isPromoting).toEqual(true);
        });
    });

    describe('setSelection', () => {
        test('should set selection in state', () => {
            const payload = { location: 2, range: mockRange };
            const newState = reducer(state, setSelectionAction(payload));

            expect(newState.selection).toEqual({ ...state.selection, location: 2 });
        });
    });
});
