import { isValidHighlight, getHighlightArea, getSelectionRange, sortHighlight } from '../highlightUtil';
import { annotation as mockAnnotation, rect as mockRect, target as mockTarget } from '../__mocks__/data';
import { Rect, AnnotationHighlight } from '../../@types';

describe('highlight/highlightUtil', () => {
    describe('isValidHighlight()', () => {
        test.each`
            height | width | x     | y     | isValid
            ${10}  | ${20} | ${5}  | ${5}  | ${true}
            ${-1}  | ${20} | ${5}  | ${5}  | ${false}
            ${10}  | ${-1} | ${5}  | ${5}  | ${false}
            ${10}  | ${20} | ${-1} | ${5}  | ${false}
            ${10}  | ${20} | ${5}  | ${-1} | ${false}
        `('should return $isValid based on the rect properties', ({ height, width, x, y, isValid }) => {
            const rect: Rect = {
                ...mockRect,
                height,
                width,
                x,
                y,
            };
            const target = { ...mockTarget, shapes: [rect] };
            const highlight: AnnotationHighlight = {
                ...mockAnnotation,
                target,
            };

            expect(isValidHighlight(highlight)).toBe(isValid);
        });
    });

    describe('getHighlightArea()', () => {
        test('should get total highlighted area', () => {
            const shapes = [mockRect, mockRect];
            expect(getHighlightArea(shapes)).toBe(400);
        });
    });

    describe('getSelectionRange()', () => {
        test.each`
            selection                        | result
            ${null}                          | ${null}
            ${{ isCollapsed: true }}         | ${null}
            ${{ getRangeAt: () => 'range' }} | ${'range'}
        `('should return selection as $result', ({ selection, result }) => {
            jest.spyOn(window, 'getSelection').mockImplementationOnce(() => selection);

            expect(getSelectionRange()).toBe(result);
        });
    });

    describe('sortHighlight()', () => {
        test.each`
            widthA | heightA | widthB | heightB | returnValue
            ${1}   | ${1}    | ${1}   | ${2}    | ${1}
            ${2}   | ${1}    | ${1}   | ${1}    | ${-1}
            ${1}   | ${1}    | ${1}   | ${1}    | ${1}
        `(
            'should compare highlights based on area $areaA and $areaB with return $returnValue',
            ({ widthA, heightA, widthB, heightB, returnValue }) => {
                const rectA = {
                    ...mockRect,
                    height: heightA,
                    width: widthA,
                };
                const rectB = {
                    ...mockRect,
                    height: heightB,
                    width: widthB,
                };
                const targetA = {
                    ...mockTarget,
                    shapes: [rectA],
                };
                const targetB = {
                    ...mockTarget,
                    shapes: [rectB],
                };
                expect(
                    sortHighlight({ ...mockAnnotation, target: targetA }, { ...mockAnnotation, target: targetB }),
                ).toBe(returnValue);
            },
        );
    });
});
