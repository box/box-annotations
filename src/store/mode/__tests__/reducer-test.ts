import modeReducer from '../reducer';
import { toggleAnnotationModeAction } from '../actions';
import { Mode } from '../types';

describe('store/mode/reducer', () => {
    describe('toggleAnnotationModeAction', () => {
        const { NONE, REGION } = Mode;
        test.each`
            payloadMode | currentMode | expectedMode
            ${REGION}   | ${NONE}     | ${REGION}
            ${REGION}   | ${REGION}   | ${NONE}
        `('should toggle the current mode appropriately', ({ payloadMode, currentMode, expectedMode }) => {
            const newState = modeReducer({ current: currentMode }, toggleAnnotationModeAction(payloadMode));
            expect(newState).toEqual({ current: expectedMode });
        });
    });
});
