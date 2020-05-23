import { Rect } from '../../@types';
import { annotation } from '../__mocks__/data';
import { centerRegion, centerShape, isRegion, scaleShape, styleShape } from '../regionUtil';

describe('regionUtil', () => {
    const getRect = (): Rect => ({
        type: 'rect',
        height: 50,
        width: 50,
        x: 10,
        y: 10,
    });

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

    describe('scaleShape()', () => {
        test('should scale up the underlying shape without rounding', () => {
            const shape = scaleShape(getRect(), 2.25);

            expect(shape).toMatchObject({
                type: 'rect',
                height: 112.5,
                width: 112.5,
                x: 22.5,
                y: 22.5,
            });
        });

        test('should scale down the underlying shape if the invert option is true', () => {
            const shape = scaleShape(getRect(), 2, true);

            expect(shape).toMatchObject({
                type: 'rect',
                height: 25,
                width: 25,
                x: 5,
                y: 5,
            });
        });
    });

    describe('styleShape()', () => {
        test('should return styles for a shape with with border space included', () => {
            const styles = styleShape(getRect());

            expect(styles).toMatchObject({
                display: 'block',
                height: '58px',
                transform: 'translate(6px, 6px)',
                width: '58px',
            });
        });

        test('should return gpu-accelerated styles for a shape with with border space included', () => {
            const styles = styleShape(getRect(), true);

            expect(styles).toMatchObject({
                display: 'block',
                height: '58px',
                transform: 'translate3d(6px, 6px, 0)',
                width: '58px',
            });
        });

        test('should return the default empty styles if the shape is not defined', () => {
            expect(styleShape()).toEqual({ display: 'none' });
        });
    });
});
