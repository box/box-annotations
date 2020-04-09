import { state } from '../__mocks__/state';
import { getAnnotationMode, getVisibility } from '../selectors';

describe('store/common/selectors', () => {
    describe('getAnnotationMode', () => {
        test('should return annotation mode', () => {
            expect(getAnnotationMode({ common: state })).toBe('none');
        });
    });

    describe('getVisibility', () => {
        test('should return annotation visibility', () => {
            expect(getVisibility({ common: state })).toBe(true);
        });
    });
});
