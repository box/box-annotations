import modeReducer from '../reducer';
import { toggleAnnotationModeAction } from '../actions';

describe('store/mode/reducer', () => {
    describe('toggleAnnotationModeAction', () => {
        test.each([
            ['region', 'none', 'region'],
            ['region', 'region', 'none'],
        ])('should toggle the current mode appropriately', (payloadMode, currentMode, expectedMode) => {
            const newState = modeReducer({ current: currentMode }, toggleAnnotationModeAction(payloadMode));
            expect(newState).toEqual({ current: expectedMode });
        });
    });
});
