import reducer from '../reducer';
import state from '../__mocks__/commonState';
import { Mode } from '../types';
import { toggleAnnotationModeAction } from '../actions';

describe('store/common/reducer', () => {
    describe('toggleAnnotationModeAction', () => {
        const { NONE, REGION } = Mode;
        test.each`
            payloadMode | currentMode | expectedMode
            ${REGION}   | ${NONE}     | ${REGION}
            ${REGION}   | ${REGION}   | ${NONE}
        `('should toggle the current mode appropriately', ({ payloadMode, currentMode, expectedMode }) => {
            const newState = reducer({ ...state, mode: currentMode }, toggleAnnotationModeAction(payloadMode));
            expect(newState.mode).toEqual(expectedMode);
        });
    });
});
