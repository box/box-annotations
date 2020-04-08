import commonReducer from '../reducer';
import { toggleAnnotationVisibilityAction } from '../actions';

describe('store/common/reducer', () => {
    describe('toggleAnnotationVisibilityAction', () => {
        test('should toggle visibility state', () => {
            let newState = commonReducer({ visible: true }, toggleAnnotationVisibilityAction());
            expect(newState).toEqual({ visible: false });

            newState = commonReducer({ visible: false }, toggleAnnotationVisibilityAction());
            expect(newState).toEqual({ visible: true });
        });
    });
});
