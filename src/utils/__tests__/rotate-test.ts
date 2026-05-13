import { getElementLocalPosition, getPoints, getRotatedShape, selectTransformationPoint } from '../../utils/rotate';

describe('rotate', () => {
    const parseValue = (value: number): number => parseFloat(value.toFixed(3));

    const shape = { height: 2, width: 3, x: 1, y: 1 };
    const shapeRotated90 = { height: 3, width: 2, x: 1, y: 96 };
    const shapeRotated180 = { height: 2, width: 3, x: 96, y: 97 };
    const shapeRotated270 = { height: 3, width: 2, x: 97, y: 1 };

    describe('getPoints()', () => {
        test('should return the points based on a shape', () => {
            const [p1, p2, p3, p4] = getPoints(shape);
            expect(p1).toEqual({ x: 1, y: 1 });
            expect(p2).toEqual({ x: 4, y: 1 });
            expect(p3).toEqual({ x: 4, y: 3 });
            expect(p4).toEqual({ x: 1, y: 3 });
        });
    });

    describe('selectTransformationPoint()', () => {
        test.each`
            rotation | expectedPoint
            ${0}     | ${{ x: 1, y: 1 }}
            ${-90}   | ${{ x: 4, y: 1 }}
            ${-180}  | ${{ x: 4, y: 3 }}
            ${-270}  | ${{ x: 1, y: 3 }}
            ${-360}  | ${{ x: 1, y: 1 }}
        `(
            'should return the appropriate point if shape=$shape and rotation=$rotation',
            ({ rotation, expectedPoint }) => {
                expect(selectTransformationPoint(shape, rotation)).toEqual(expectedPoint);
            },
        );
    });

    describe('getElementLocalPosition()', () => {
        const createElement = (width: number, height: number, rect: Partial<DOMRect> = {}) => {
            const el = document.createElement('div');
            Object.defineProperty(el, 'offsetWidth', { get: () => width });
            Object.defineProperty(el, 'offsetHeight', { get: () => height });
            jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                top: 0,
                right: width,
                bottom: height,
                width,
                height,
                x: 0,
                y: 0,
                toJSON: jest.fn(),
                ...rect,
            });
            return el;
        };

        test.each`
            rotation | clientX | clientY | rectWidth | rectHeight | expectedX | expectedY
            ${0}     | ${75}   | ${55}   | ${100}    | ${100}     | ${75}     | ${55}
            ${-90}   | ${0}    | ${0}    | ${100}    | ${100}     | ${100}    | ${0}
            ${-180}  | ${25}   | ${25}   | ${100}    | ${100}     | ${75}     | ${75}
            ${-270}  | ${75}   | ${25}   | ${100}    | ${100}     | ${25}     | ${25}
        `(
            'should map window coords ($clientX, $clientY) to element-local coords ($expectedX, $expectedY) at rotation=$rotation',
            ({ rotation, clientX, clientY, rectWidth, rectHeight, expectedX, expectedY }) => {
                const el = createElement(100, 100, { left: 0, top: 0, width: rectWidth, height: rectHeight });
                const [x, y] = getElementLocalPosition(clientX, clientY, el, rotation);

                expect(Math.round(x)).toBe(expectedX);
                expect(Math.round(y)).toBe(expectedY);
            },
        );

        test('should account for element screen offset', () => {
            const el = createElement(100, 100, { left: 100, top: 200, width: 100, height: 100 });
            // Click at center of element on screen → maps to center regardless of rotation
            const [x, y] = getElementLocalPosition(150, 250, el, -90);

            expect(Math.round(x)).toBe(50);
            expect(Math.round(y)).toBe(50);
        });
    });

    describe('getRotatedShape()', () => {
        test.each`
            rotation | expectedShape
            ${0}     | ${shape}
            ${-90}   | ${shapeRotated90}
            ${-180}  | ${shapeRotated180}
            ${-270}  | ${shapeRotated270}
            ${-360}  | ${shape}
        `(
            'should return the transformed shape based on rotation=$rotation and reference element',
            ({ rotation, expectedShape }) => {
                const { height: expHeight, width: expWidth, x: expX, y: expY } = expectedShape;
                const { height, width, x = NaN, y = NaN } = getRotatedShape(shape, rotation) || {};

                expect({ height, width }).toEqual({ height: expHeight, width: expWidth });
                expect(parseValue(x)).toEqual(parseValue(expX));
                expect(parseValue(y)).toEqual(parseValue(expY));
            },
        );

        test('should transform -90deg shape back to an unrotated state', () => {
            const { height, width, x, y } = getRotatedShape(shapeRotated90, -270);
            const { height: expHeight, width: expWidth, x: expX, y: expY } = shape;
            expect({ height, width }).toEqual({ height: expHeight, width: expWidth });
            expect(parseValue(x)).toEqual(parseValue(expX));
            expect(parseValue(y)).toEqual(parseValue(expY));
        });
    });
});
