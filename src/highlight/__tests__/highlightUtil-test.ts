import { centerHighlight, getBoundingRect } from '../highlightUtil';

const shape1: Required<DOMRectInit> = {
    height: 10,
    width: 10,
    x: 0,
    y: 0,
};

const shape2: Required<DOMRectInit> = {
    height: 10,
    width: 20,
    x: 10,
    y: 10,
};

describe('highlightUtil', () => {
    describe('getBoundingRect()', () => {
        test('should be the same rect for a single shape', () => {
            expect(getBoundingRect([shape1])).toEqual(shape1);
        });

        test('should get the bounding rect for multiple shapes', () => {
            expect(getBoundingRect([shape1, shape2])).toEqual({
                height: 20,
                width: 30,
                x: 0,
                y: 0,
            });
        });
    });

    describe('centerHighlight()', () => {
        test.each`
            shapes              | expectedCenter
            ${[shape1]}         | ${{ x: 5, y: 5 }}
            ${[shape2]}         | ${{ x: 20, y: 15 }}
            ${[shape1, shape2]} | ${{ x: 15, y: 10 }}
        `('should get the center of the highlight to be $expectedCenter', ({ shapes, expectedCenter }) => {
            expect(centerHighlight(shapes)).toEqual(expectedCenter);
        });
    });
});
