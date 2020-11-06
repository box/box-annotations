import { Annotation } from '../../@types';
import { annotations } from '../__mocks__/data';
import { getCenter, getShape, isDrawing } from '../drawingUtil';

describe('drawingUtil', () => {
    describe('getCenter()', () => {
        test('should return the position of the center of the shape', () => {
            expect(getCenter({ height: 50, width: 50, x: 0, y: 0 })).toMatchObject({ x: 25, y: 25 });
        });
    });

    describe('getShape()', () => {
        test('should return the bounding box of path groups', () => {
            expect(getShape(annotations[0].target.path_groups)).toMatchObject({
                height: 12,
                width: 12,
                x: 10,
                y: 10,
            });
        });
    });

    describe('isDrawing()', () => {
        test.each`
            type         | result
            ${'drawing'} | ${true}
            ${'region'}  | ${false}
            ${''}        | ${false}
            ${undefined} | ${false}
            ${null}      | ${false}
        `('should return $result for annotation of type $type', ({ result, type }) => {
            expect(isDrawing({ ...annotations[0], target: { type } } as Annotation)).toEqual(result);
        });
    });
});
