import { getPoints, getRotatedShape, selectTransformationPoint } from '../../utils/rotate';

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
