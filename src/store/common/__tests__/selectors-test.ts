import { state } from '../__mocks__/state';
import { getAnnotationMode, getAnnotationVisibility } from '../selectors';

describe('store/common/selectors', () => {
    describe('getAnnotationMode', () => {
        test('should return annotation mode', () => {
            expect(getAnnotationMode({ common: state })).toBe('none');
        });
    });

    describe('getAnnotationVisibility', () => {
        test('should return annotation visibility', () => {
            expect(getAnnotationVisibility({ common: state })).toBe(true);
        });
    });
});
