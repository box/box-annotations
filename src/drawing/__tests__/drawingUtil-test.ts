import { Annotation } from '../../@types';
import { annotations } from '../__mocks__/drawingData';
import { addClientIds, getCenter, getShape, isDrawing } from '../drawingUtil';

describe('drawingUtil', () => {
    describe('addClientIds()', () => {
        test('should add ids to path groups and paths', () => {
            const pathGroups = [
                {
                    paths: [{ points: [] }],
                    stroke: { color: '#000', size: 1 },
                },
            ];

            const pathGroupsWithIds = addClientIds(pathGroups);

            expect(pathGroupsWithIds[0].clientId).not.toBeUndefined();
            expect(pathGroupsWithIds[0].paths[0].clientId).not.toBeUndefined();
        });
    });

    describe('getCenter()', () => {
        test.each`
            shape                                          | result
            ${{ height: 50, width: 50, x: 0, y: 0 }}       | ${{ x: 25, y: 25 }}
            ${{ height: 0, width: 0, x: 0, y: 0 }}         | ${{ x: 0, y: 0 }}
            ${{ height: 100, width: 100, x: 100, y: 100 }} | ${{ x: 150, y: 150 }}
        `('should return the position of the center of the shape', ({ shape, result }) => {
            expect(getCenter(shape)).toMatchObject(result);
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

        test('should return zeros if no paths', () => {
            expect(getShape([])).toMatchObject({
                height: 0,
                width: 0,
                x: 0,
                y: 0,
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
