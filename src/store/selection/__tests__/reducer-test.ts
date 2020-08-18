import reducer from '../reducer';
import state from '../__mocks__/selectionState';
import { mockRange } from '../__mocks__/range';
import { setSelectionAction } from '../actions';

describe('store/selection/reducer', () => {
    describe('setSelection', () => {
        test('should set selection in state', () => {
            const payload = { location: 2, range: mockRange };
            const newState = reducer(state, setSelectionAction(payload));

            expect(newState.selection).toEqual({ ...state.selection, location: 2 });
        });
    });
});
