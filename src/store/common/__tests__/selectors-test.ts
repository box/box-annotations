import { getAnnotationVisibility } from '../selectors';
import initialState from '../../initialState';

describe('store/common/selectors', () => {
    describe('getAnnotationVisibility', () => {
        test('should return annotation visibility', () => {
            const state = {
                ...initialState,
                common: { visible: false },
            };

            expect(getAnnotationVisibility(state)).toBe(false);
        });
    });
});
