import { Rect } from '../../@types';
import { annotation } from '../__mocks__/data';
import { centerRegion, centerShape, isRegion, styleShape } from '../regionUtil';
import { getPoints, getRotatedShape, selectTransformationPoint } from '../../utils/rotate';

describe('regionUtil', () => {
    const getRect = (): Rect => ({
        type: 'rect',
        height: 50,
        width: 50,
        x: 10,
        y: 10,
    });
    const parseValue = (value: number): number => parseFloat(value.toFixed(3));

    const regionShape = { height: 2, width: 3, x: 1, y: 1 };
    const regionShapeRotated90 = { height: 3, width: 2, x: 1, y: 96 };
    const regionShapeRotated180 = { height: 2, width: 3, x: 96, y: 97 };
    const regionShapeRotated270 = { height: 3, width: 2, x: 97, y: 1 };

    describe('centerShape()', () => {
        test('should return the position of the center of the shape', () => {
            const shape = centerShape(getRect());

            expect(shape).toMatchObject({ x: 25, y: 25 });
        });
    });

    describe('centerRegion()', () => {
        test('should return the position of the center of the shape offset by its x/y coordinates', () => {
            const shape = centerRegion(getRect());

            expect(shape).toMatchObject({ x: 35, y: 35 });
        });
    });

    describe('getPoints()', () => {
        test('should return the points based on a region shape', () => {
            const [p1, p2, p3, p4] = getPoints(regionShape);
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
                expect(selectTransformationPoint(regionShape, rotation)).toEqual(expectedPoint);
            },
        );
    });

    describe('getTransformedShape()', () => {
        test.each`
            rotation | expectedShape
            ${0}     | ${regionShape}
            ${-90}   | ${regionShapeRotated90}
            ${-180}  | ${regionShapeRotated180}
            ${-270}  | ${regionShapeRotated270}
            ${-360}  | ${regionShape}
        `(
            'should return the transformed shape based on rotation=$rotation and reference element',
            ({ rotation, expectedShape }) => {
                const { height: expHeight, width: expWidth, x: expX, y: expY } = expectedShape;
                const { height, width, x = NaN, y = NaN } = getRotatedShape(regionShape, rotation) || {};

                expect({ height, width }).toEqual({ height: expHeight, width: expWidth });
                expect(parseValue(x)).toEqual(parseValue(expX));
                expect(parseValue(y)).toEqual(parseValue(expY));
            },
        );

        test('should transform -90deg shape back to an unrotated state', () => {
            const { height, width, x, y } = getRotatedShape(regionShapeRotated90, -270);
            const { height: expHeight, width: expWidth, x: expX, y: expY } = regionShape;
            expect({ height, width }).toEqual({ height: expHeight, width: expWidth });
            expect(parseValue(x)).toEqual(parseValue(expX));
            expect(parseValue(y)).toEqual(parseValue(expY));
        });
    });

    describe('isRegion()', () => {
        test.each`
            type         | result
            ${'region'}  | ${true}
            ${'point'}   | ${false}
            ${''}        | ${false}
            ${undefined} | ${false}
            ${null}      | ${false}
        `('should return $result for annotation of type $type', ({ result, type }) => {
            expect(isRegion({ ...annotation, target: { ...annotation.target, type } })).toEqual(result);
        });
    });

    describe('styleShape()', () => {
        test('should return styles for a shape', () => {
            const styles = styleShape(getRect());

            expect(styles).toMatchObject({
                display: 'block',
                height: '50%',
                left: '10%',
                top: '10%',
                width: '50%',
            });
        });

        test('should return the default empty styles if the shape is not defined', () => {
            expect(styleShape()).toEqual({ display: 'none' });
        });
    });
});
