import DrawingPath from '../DrawingPath';

let drawingPath;

describe('drawing/DrawingPath', () => {
    beforeEach(() => {
        drawingPath = new DrawingPath();
    });

    afterEach(() => {
        drawingPath = null;
    });

    describe('initPath()', () => {
        it('should do nothing if no path data was provided', () => {
            drawingPath.initPath();
            expect(drawingPath.path.length).toEqual(0);
        });

        it('should generate path of Location objects from provided data', () => {
            const data = {
                path: [{ x: 1, y: 1 }, { x: 2, y: 2 }]
            };
            drawingPath.initPath(data);
            expect(drawingPath.path.length).toEqual(2);
            expect(drawingPath.minX).toEqual(1);
            expect(drawingPath.minY).toEqual(1);
            expect(drawingPath.maxX).toEqual(2);
            expect(drawingPath.maxY).toEqual(2);
        });
    });

    describe('addCoordinate()', () => {
        it('should do nothing if x or y is empty', () => {
            let lengthBefore = drawingPath.path.length;
            drawingPath.addCoordinate({
                x: null,
                y: 2
            });
            drawingPath.addCoordinate({
                x: 2,
                y: null
            });

            let lengthAfter = drawingPath.path.length;

            expect(lengthAfter).toEqual(lengthBefore);

            lengthBefore = drawingPath.browserPath.length;
            drawingPath.addCoordinate(
                {
                    x: 1,
                    y: 1
                },
                {
                    x: null,
                    y: 1
                }
            );
            drawingPath.addCoordinate(
                {
                    x: 1,
                    y: 1
                },
                {
                    x: 1,
                    y: null
                }
            );
            lengthAfter = drawingPath.browserPath.length;
            expect(lengthAfter).toEqual(lengthBefore);
        });

        it('should insert the new coordinate into its path container', () => {
            const lengthBefore = drawingPath.path.length;
            drawingPath.addCoordinate({
                x: 1,
                y: 2
            });
            const lengthAfter = drawingPath.path.length;

            expect(lengthAfter).toEqual(lengthBefore + 1);
            expect(drawingPath.path[lengthAfter - 1]).toStrictEqual({
                x: 1,
                y: 2
            });
        });

        it('should update the bounding rectangle', () => {
            const rectBounds = {
                x1: 1,
                x2: 5,
                y1: 2,
                y2: 6
            };

            drawingPath.addCoordinate({
                x: rectBounds.x1,
                y: rectBounds.y1
            });
            drawingPath.addCoordinate({
                x: rectBounds.x2,
                y: rectBounds.y2
            });

            expect(drawingPath.minY).toEqual(rectBounds.y1);
            expect(drawingPath.minX).toEqual(rectBounds.x1);
            expect(drawingPath.maxY).toEqual(rectBounds.y2);
            expect(drawingPath.maxX).toEqual(rectBounds.x2);
        });
    });

    describe('isEmpty()', () => {
        it('should return true when nothing has been inserted', () => {
            expect(drawingPath.isEmpty()).toBeTruthy();
        });

        it('should return false when a coordinate has been inserted', () => {
            const coord = {
                x: 1,
                y: 1
            };
            drawingPath.addCoordinate(coord);
            expect(drawingPath.isEmpty()).toBeFalsy();
        });
    });

    describe('drawPath()', () => {
        it('should do nothing when no context or browser path exist', () => {
            drawingPath.drawPath({});

            drawingPath.browserPath = {
                forEach: jest.fn()
            };
            drawingPath.drawPath();
            expect(drawingPath.browserPath.forEach).not.toBeCalled();
        });

        it('should draw when there are browser coordinates', () => {
            const context = {
                quadraticCurveTo: jest.fn(),
                moveTo: jest.fn()
            };
            const docCoord = {
                x: 1,
                y: 1
            };
            const browserCoord = {
                x: 1,
                y: 1
            };

            drawingPath.addCoordinate(docCoord, browserCoord);
            drawingPath.addCoordinate(docCoord, browserCoord);
            drawingPath.drawPath(context);

            expect(context.quadraticCurveTo).toBeCalledTimes(2);
            expect(context.moveTo).toBeCalledTimes(1);
        });

        it('should not draw when there are no browser coordinates', () => {
            const context = {
                quadraticCurveTo: jest.fn(),
                moveTo: jest.fn()
            };

            drawingPath.path.push({
                x: 1,
                y: 1
            });

            expect(drawingPath.browserPath.length).toEqual(0);
            drawingPath.drawPath(context);

            expect(context.quadraticCurveTo).not.toBeCalled();
            expect(context.moveTo).not.toBeCalled();
        });
    });

    describe('generateBrowserPath()', () => {
        it('should do nothing when no path exists', () => {
            const transform = jest.fn();
            drawingPath.path = undefined;
            drawingPath.generateBrowserPath(transform);
            expect(transform).not.toBeCalled();
        });

        it('should generate the browser path', () => {
            const lengthBefore = drawingPath.browserPath.length;

            // eslint-disable-next-line require-jsdoc
            const transform = (coord) => {
                return {
                    x: coord.x + 1,
                    y: coord.y + 1
                };
            };
            const documentCoord = {
                x: 1,
                y: 2
            };

            drawingPath.path = [documentCoord];
            drawingPath.generateBrowserPath(transform);

            const lengthAfter = drawingPath.browserPath.length;

            // eslint-disable-next-line require-jsdoc
            const isBrowserCoord = (item) => item.x === documentCoord.x + 1 && item.y === documentCoord.y + 1;
            expect(lengthBefore).toBeLessThan(lengthAfter);
            expect(drawingPath.browserPath.find(isBrowserCoord)).not.toBeUndefined();
        });
    });

    describe('extractDrawingInfo()', () => {
        it('should start an accumulator if objectA is a drawing path', () => {
            const drawingObjA = {
                path: 'pathHereA',
                minX: 5,
                maxX: 6,
                minY: 7,
                maxY: 8
            };

            const result = DrawingPath.extractDrawingInfo(drawingObjA, {});
            expect(result.minX).toEqual(drawingObjA.minX);
            expect(result.minY).toEqual(drawingObjA.minY);
            expect(result.maxX).toEqual(drawingObjA.maxX);
            expect(result.maxY).toEqual(drawingObjA.maxY);
            expect(result.paths).toStrictEqual([{ path: drawingObjA.path }]);
        });

        it('should add a path to the accumulator', () => {
            const acc = {
                paths: [{ path: 'pathA' }, { path: 'pathB' }],
                minX: 5,
                maxX: 11,
                minY: 6,
                maxY: 12
            };
            const drawingObjC = {
                path: 'pathC',
                minX: 3,
                maxX: 10,
                minY: 5,
                maxY: 11
            };

            const result = DrawingPath.extractDrawingInfo(drawingObjC, acc);
            expect(result.minX).toEqual(drawingObjC.minX);
            expect(result.minY).toEqual(drawingObjC.minY);
            expect(result.maxX).toEqual(acc.maxX);
            expect(result.maxY).toEqual(acc.maxY);
            expect(result.paths).toStrictEqual([{ path: 'pathA' }, { path: 'pathB' }, { path: 'pathC' }]);
        });
    });
});
