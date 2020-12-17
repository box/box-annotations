import reducer from '../reducer';
import state from '../__mocks__/commonState';
import { Mode } from '../types';
import { setColorAction, toggleAnnotationModeAction } from '../actions';

describe('store/common/reducer', () => {
    describe('setColorAction', () => {
        test('should set the color in state', () => {
            const newState = reducer(state, setColorAction('#111'));

            expect(newState.color).toEqual('#111');
        });
    });

    describe('toggleAnnotationModeAction', () => {
        const { NONE, REGION } = Mode;
        test.each`
            payloadMode | currentMode | expectedMode
            ${REGION}   | ${NONE}     | ${REGION}
            ${REGION}   | ${REGION}   | ${REGION}
        `('should toggle the current mode appropriately', ({ payloadMode, currentMode, expectedMode }) => {
            const newState = reducer({ ...state, mode: currentMode }, toggleAnnotationModeAction(payloadMode));
            expect(newState.mode).toEqual(expectedMode);
        });
    });
});
