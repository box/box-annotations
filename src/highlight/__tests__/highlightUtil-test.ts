import {
    centerHighlight,
    combineRects,
    dedupeRects,
    getBoundingRect,
    getShapeRelativeToContainer,
} from '../highlightUtil';
import { selection } from '../__mocks__/data';
import { Shape } from '../../@types';

const shape1: Shape = {
    height: 10,
    width: 10,
    x: 0,
    y: 0,
};

const shape2: Shape = {
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

    describe('dedupeRects()', () => {
        test('should dedupe rects', () => {
            const rects = [
                {
                    height: 20,
                    width: 30,
                    x: 100,
                    y: 200,
                },
                {
                    height: 21,
                    width: 30,
                    x: 103,
                    y: 202,
                },
            ];

            const defaultResult = dedupeRects(rects);
            expect(defaultResult).toHaveLength(1);
            expect(defaultResult[0].height).toEqual(21);

            expect(dedupeRects(rects, 0.05)).toHaveLength(2);
        });
    });

    describe('combineRects()', () => {
        test('should combine rects by row', () => {
            const rects = [
                {
                    height: 20,
                    width: 100,
                    x: 100,
                    y: 200,
                },
                {
                    height: 21,
                    width: 100,
                    x: 200,
                    y: 200,
                },
                {
                    height: 22,
                    width: 100,
                    x: 300,
                    y: 199.5,
                },
                {
                    height: 21,
                    width: 100,
                    x: 500,
                    y: 200,
                }, // this rect, while having the same y coordinate as the previous rects is not near enough in the x coordinate to combine so should be it's own rect
                {
                    height: 23,
                    width: 100,
                    x: 400,
                    y: 300,
                },
            ];

            const result = combineRects(rects);
            expect(result).toHaveLength(3);
            expect(result[0]).toEqual({
                height: 22,
                width: 300,
                x: 100,
                y: 199.5,
            });
            expect(result[1]).toEqual(rects[3]);
            expect(result[2]).toEqual(rects[4]);
        });
    });

    describe('getShapeRelativeToContainer', () => {
        test('should get relative coordinates', () => {
            const { rects, containerRect } = selection;

            expect(getShapeRelativeToContainer(rects[0], containerRect)).toEqual({
                height: 10,
                width: 10,
                x: 20,
                y: 20,
            });
        });
    });
});
