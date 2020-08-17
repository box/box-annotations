import { isValidHighlight, getHighlightArea, getRange, getSelectionItem, sortHighlight } from '../highlightUtil';
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

    describe('getRange()', () => {
        test.each`
            selection                        | result
            ${null}                          | ${null}
            ${{ isCollapsed: true }}         | ${null}
            ${{ getRangeAt: () => 'range' }} | ${'range'}
        `('should return range as $result', ({ selection, result }) => {
            jest.spyOn(window, 'getSelection').mockImplementationOnce(() => selection);

            expect(getRange()).toBe(result);
        });
    });

    describe('getSelectionItem()', () => {
        const rootElement = document.createElement('div');
        rootElement.innerHTML = `
            <div class="range0" />
            <div class="page" data-page-number="1">
                <div class="range1" />
            </div>
            <div class="page" data-page-number="2">
                <div class="range2" />
            </div>
        `;

        const generateSelection = (startClass: string, endClass: string): Selection => {
            return ({
                getRangeAt: () => {
                    const range = document.createRange();
                    range.setStart(rootElement.querySelector(startClass) as Node, 0);
                    range.setEnd(rootElement.querySelector(endClass) as Node, 0);
                    range.getBoundingClientRect = jest.fn().mockReturnValueOnce({});
                    return range;
                },
            } as unknown) as Selection;
        };

        test('should return null if range is null', () => {
            jest.spyOn(window, 'getSelection').mockImplementationOnce(() => null);
            expect(getSelectionItem()).toBe(null);
        });

        test.each`
            startClass   | endClass     | result
            ${'.range0'} | ${'.range0'} | ${null}
            ${'.range1'} | ${'.range0'} | ${null}
            ${'.range1'} | ${'.range2'} | ${null}
            ${'.range1'} | ${'.range1'} | ${expect.objectContaining({ location: 1 })}
        `('should return $result', ({ startClass, endClass, result }) => {
            jest.spyOn(window, 'getSelection').mockReturnValueOnce(generateSelection(startClass, endClass));

            expect(getSelectionItem()).toEqual(result);
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
