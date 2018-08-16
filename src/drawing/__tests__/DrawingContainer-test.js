/* eslint-disable no-unused-expressions */
import DrawingContainer from '../DrawingContainer';

let drawingContainer;

describe('drawing/DrawingContainer', () => {
    beforeEach(() => {
        drawingContainer = new DrawingContainer();
    });

    afterEach(() => {
        drawingContainer = null;
    });

    describe('destroy()', () => {
        it('should clear the undo and redo stack', () => {
            drawingContainer.redoStack = [1, 2, 3];
            drawingContainer.undoStack = [1, 2, 3];

            drawingContainer.destroy();

            expect(drawingContainer.undoStack.length).toEqual(0);
            expect(drawingContainer.redoStack.length).toEqual(0);
        });
    });

    describe('insert()', () => {
        it('should insert an item into the undoStack and clear the redo stack', () => {
            drawingContainer.redoStack = [1, 2, 3];
            expect(drawingContainer.undoStack.length).toEqual(0);
            drawingContainer.insert(4);
            expect(drawingContainer.undoStack.length).toEqual(1);
            expect(drawingContainer.redoStack.length).toEqual(0);
        });
    });

    describe('undo()', () => {
        it('should not undo when the undo stack is empty', () => {
            expect(drawingContainer.undoStack.length).toEqual(0);
            const val = drawingContainer.undo();
            expect(val).toBeFalsy();
        });

        it('should move an item from the top of the undo stack to the top of the redo stack', () => {
            drawingContainer.undoStack = [1, 2, 3];
            drawingContainer.redoStack = [4, 5, 6];
            const lengthBefore = drawingContainer.undoStack.length;
            const topUndo = drawingContainer.undoStack[lengthBefore - 1];
            const val = drawingContainer.undo();

            expect(val).toBeTruthy();
            expect(drawingContainer.undoStack.length).toEqual(lengthBefore - 1);
            expect(drawingContainer.redoStack.length).toEqual(lengthBefore + 1);
            expect(drawingContainer.redoStack[lengthBefore]).toEqual(topUndo);
        });
    });

    describe('redo()', () => {
        it('should not redo when the redo stack is empty', () => {
            expect(drawingContainer.redoStack.length).toEqual(0);
            const val = drawingContainer.redo();
            expect(val).toBeFalsy();
        });

        it('should move an item from the top of the redo stack to the top of the undo stack', () => {
            drawingContainer.undoStack = [1, 2, 3];
            drawingContainer.redoStack = [4, 5, 6];
            const lengthBefore = drawingContainer.redoStack.length;
            const topRedo = drawingContainer.redoStack[lengthBefore - 1];
            const val = drawingContainer.redo();

            expect(val).toBeTruthy();
            expect(drawingContainer.redoStack.length).toEqual(lengthBefore - 1);
            expect(drawingContainer.undoStack.length).toEqual(lengthBefore + 1);
            expect(drawingContainer.undoStack[lengthBefore]).toEqual(topRedo);
        });
    });

    describe('getNumberOfItems()', () => {
        it('should return the number of items on the undo stack and redo stack', () => {
            drawingContainer.undoStack = [1, 2, 3, 4];
            drawingContainer.redoStack = [1, 2];
            const val = drawingContainer.getNumberOfItems();

            expect(val.undoCount).toEqual(drawingContainer.undoStack.length);
            expect(val.redoCount).toEqual(drawingContainer.redoStack.length);
        });
    });

    describe('getItems()', () => {
        it('should get the items on the undoStack', () => {
            drawingContainer.undoStack = [1, 2, 3, 4];
            drawingContainer.redoStack = [1, 2];
            const val = drawingContainer.getItems();

            expect(val).not.toStrictEqual(drawingContainer.redoStack);
            expect(val).toStrictEqual(drawingContainer.undoStack);
        });
    });

    describe('applyToItems()', () => {
        it('should apply the function only to items on the undo stack', () => {
            const counter = {
                count: 0
            };
            drawingContainer.undoStack = [counter, counter, counter, counter];
            drawingContainer.redoStack = [counter];
            // eslint-disable-next-line
            drawingContainer.applyToItems((item) => (item.count += 1));

            expect(counter.count).toEqual(drawingContainer.undoStack.length);
        });

        it('should apply the function to items on the undo and redo stack', () => {
            const counter = {
                count: 0
            };
            drawingContainer.undoStack = [counter, counter, counter, counter];
            drawingContainer.redoStack = [counter, counter];
            // eslint-disable-next-line
            drawingContainer.applyToItems((item) => (item.count += 1), true);

            expect(counter.count).toEqual(drawingContainer.undoStack.length + drawingContainer.redoStack.length);
        });
    });

    describe('getAxisAlignedBoundingBox()', () => {
        it('should return a boundary of infinity when no items are stored', () => {
            drawingContainer.getItems = jest.fn().mockReturnValue([]);

            const returnValue = drawingContainer.getAxisAlignedBoundingBox();
            expect(drawingContainer.getItems).toBeCalled();
            expect(returnValue).toStrictEqual({
                minX: Infinity,
                maxX: -Infinity,
                minY: Infinity,
                maxY: -Infinity,
                paths: []
            });
        });

        it('should get the correct boundary based on the items contained', () => {
            const path1 = {
                minX: 5,
                minY: 6,
                maxX: 8,
                maxY: 9,
                path: [1, 2, 3, 4]
            };
            const path2 = {
                minX: 3,
                minY: 7,
                maxX: 14,
                maxY: 8,
                path: [1, 2, 3]
            };
            drawingContainer.getItems = jest.fn().mockReturnValue([path1, path2]);

            const returnValue = drawingContainer.getAxisAlignedBoundingBox();
            expect(drawingContainer.getItems).toBeCalled();
            expect(returnValue).toStrictEqual({
                minX: path2.minX,
                maxX: path2.maxX,
                minY: path1.minY,
                maxY: path1.maxY,
                paths: [{ path: path1.path }, { path: path2.path }]
            });
        });
    });

    describe('isEmpty()', () => {
        it('should return true when no items are in the undoStack', () => {
            drawingContainer.undoStack = [];
            expect(drawingContainer.isEmpty()).toBeTruthy();
        });

        it('should return false when there are items are in the undoStack', () => {
            drawingContainer.undoStack = ['one'];
            expect(drawingContainer.isEmpty()).toBeFalsy();
        });
    });
});
