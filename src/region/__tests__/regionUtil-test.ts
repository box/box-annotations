import { Rect } from '../../@types';
import { scaleShape } from '../regionUtil';

describe('regionUtil', () => {
    const getRect = (): Rect => ({
        type: 'rect',
        height: 50,
        width: 50,
        x: 10,
        y: 10,
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
});
