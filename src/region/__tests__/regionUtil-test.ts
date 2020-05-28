import { Rect } from '../../@types';
import { annotation } from '../__mocks__/data';
import { centerRegion, centerShape, isRegion, styleShape } from '../regionUtil';

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
