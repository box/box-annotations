/* eslint-disable no-unused-expressions */
import DrawingThread from '../DrawingThread';
import { STATES } from '../../constants';
import * as util from '../../util';

let thread;

const html = `<div class="annotated-element">
  <div data-page-number="1"></div>
  <div data-page-number="2"></div>
</div>`;

describe('drawing/DrawingThread', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        thread = new DrawingThread({
            annotatedElement: rootElement,
            annotations: [],
            api: {},
            fileVersionId: 1,
            location: {},
            threadID: 2,
            type: 'draw'
        });
        expect(thread.state).toEqual(STATES.inactive);
        util.shouldDisplayMobileUI = jest.fn().mockReturnValue(false);
    });

    afterEach(() => {
        thread = null;
    });

    describe('destroy()', () => {
        beforeEach(() => {
            thread.state = STATES.pending;
        });

        it('should clean up drawings', () => {
            window.cancelAnimationFrame = jest.fn();
            thread.reset = jest.fn();
            thread.emit = jest.fn();
            thread.unmountPopover = jest.fn();

            thread.location.page = 1;
            thread.lastAnimationRequestId = 1;
            thread.destroy();

            expect(window.cancelAnimationFrame).toBeCalledWith(1);
            expect(thread.reset).toBeCalled();
        });
    });

    describe('reset()', () => {
        it('should clear the boundary', () => {
            thread.clearBoundary = jest.fn();
            thread.reset();
            expect(thread.clearBoundary).toBeCalled();
        });
    });

    describe('deleteThread()', () => {
        it('should delete all attached annotations, clear the drawn rectangle, and call destroy', () => {
            thread.clearBoundary = jest.fn();
            thread.delete = jest.fn();
            thread.getBrowserRectangularBoundary = jest.fn().mockReturnValue(['a', 'b', 'c', 'd']);
            thread.concreteContext = {
                clearRect: jest.fn()
            };

            thread.pathContainer = {
                destroy: jest.fn()
            };

            thread.comments = [{ id: '123abc' }];

            thread.deleteThread();
            expect(thread.getBrowserRectangularBoundary).toBeCalled();
            expect(thread.concreteContext.clearRect).toBeCalled();
            expect(thread.clearBoundary).toBeCalled();
            expect(thread.delete).toBeCalledWith({ id: '123abc' });
            expect(thread.pathContainer).toEqual(null);
        });
    });

    describe('bindDrawingListeners()', () => {
        beforeEach(() => {
            thread.hasTouch = false;
            thread.annotatedElement = {
                addEventListener: jest.fn()
            };
        });

        it('should add only mouse listeners for desktop devices', () => {
            thread.bindDrawingListeners();
            expect(thread.annotatedElement.addEventListener).toBeCalledWith('mousemove', expect.any(Function));
            expect(thread.annotatedElement.addEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(thread.annotatedElement.addEventListener).not.toBeCalledWith('touchmove', expect.any(Function));
            expect(thread.annotatedElement.addEventListener).not.toBeCalledWith('touchcancel', expect.any(Function));
            expect(thread.annotatedElement.addEventListener).not.toBeCalledWith('touchend', expect.any(Function));
        });

        it('should add all listeners for touch enabled laptop devices', () => {
            thread.hasTouch = true;
            thread.bindDrawingListeners();
            expect(thread.annotatedElement.addEventListener).not.toBeCalledWith('mousemove', expect.any(Function));
            expect(thread.annotatedElement.addEventListener).not.toBeCalledWith('mouseup', expect.any(Function));
            expect(thread.annotatedElement.addEventListener).toBeCalledWith('touchmove', expect.any(Function));
            expect(thread.annotatedElement.addEventListener).toBeCalledWith('touchcancel', expect.any(Function));
            expect(thread.annotatedElement.addEventListener).toBeCalledWith('touchend', expect.any(Function));
        });
    });

    describe('unbindDrawingListeners()', () => {
        beforeEach(() => {
            thread.annotatedElement = {
                removeEventListener: jest.fn()
            };
        });

        it('should add only mouse listeners for desktop devices', () => {
            thread.unbindDrawingListeners();
            expect(thread.annotatedElement.removeEventListener).toBeCalledWith('mousemove', expect.any(Function));
            expect(thread.annotatedElement.removeEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(thread.annotatedElement.removeEventListener).toBeCalledWith('touchmove', expect.any(Function));
            expect(thread.annotatedElement.removeEventListener).toBeCalledWith('touchcancel', expect.any(Function));
            expect(thread.annotatedElement.removeEventListener).toBeCalledWith('touchend', expect.any(Function));
        });
    });

    describe('setContextStyles()', () => {
        it('should set configurable context properties', () => {
            thread.drawingContext = {
                lineCap: 'not set',
                lineJoin: 'not set',
                strokeStyle: 'no color',
                lineWidth: 'no width'
            };

            const config = {
                scale: 2,
                color: 'blue'
            };

            thread.setContextStyles(config);
            expect(thread.drawingContext).toStrictEqual({
                lineCap: 'round',
                lineJoin: 'round',
                strokeStyle: 'blue',
                lineWidth: thread.drawingContext.lineWidth
            });
            expect(thread.drawingContext.lineWidth % config.scale).toEqual(0);
        });
    });

    describe('render()', () => {
        beforeEach(() => {
            thread.draw = jest.fn();
        });

        it('should draw the pending path when the context is not empty', () => {
            const timeStamp = 20000;
            thread.render(timeStamp);
            expect(thread.draw).toBeCalled();
        });

        it('should do nothing when the timeElapsed is less than the refresh rate', () => {
            const timeStamp = 100;
            thread.lastRenderTimestamp = 100;
            thread.render(timeStamp);
            expect(thread.draw).not.toBeCalled();
        });
    });

    describe('setup()', () => {
        it('should set the state to be pending when there are no saved annotations', () => {
            thread.setup();
            expect(thread.state).toEqual(STATES.pending);
        });

        it('should set the state to be inactive when there are saved annotations', () => {
            thread.threadNumber = '123';
            thread.setup();
            expect(thread.state).toEqual(STATES.inactive);
        });
    });

    describe('undo()', () => {
        beforeEach(() => {
            thread.draw = jest.fn();
            thread.updateBoundary = jest.fn();
            thread.regenerateBoundary = jest.fn();
            thread.drawBoundary = jest.fn();
            thread.emitAvailableActions = jest.fn();
            thread.pathContainer = {
                isEmpty: jest.fn(),
                undo: jest.fn().mockReturnValue(false)
            };
        });

        it('should do nothing when the path container fails to undo', () => {
            thread.undo();
            expect(thread.pathContainer.undo).toBeCalled();
            expect(thread.draw).not.toBeCalled();
            expect(thread.emitAvailableActions).not.toBeCalled();
            expect(thread.updateBoundary).not.toBeCalled();
            expect(thread.regenerateBoundary).not.toBeCalled();
            expect(thread.drawBoundary).not.toBeCalled();
        });

        it('should draw when the path container indicates a successful undo', () => {
            thread.pathContainer.undo = jest.fn().mockReturnValue(true);
            thread.undo();
            expect(thread.pathContainer.undo).toBeCalled();
            expect(thread.draw).toBeCalled();
            expect(thread.emitAvailableActions).toBeCalled();
            expect(thread.updateBoundary).toBeCalled();
            expect(thread.regenerateBoundary).toBeCalled();
            expect(thread.drawBoundary).toBeCalled();
        });
    });

    describe('redo()', () => {
        beforeEach(() => {
            thread.draw = jest.fn();
            thread.emitAvailableActions = jest.fn();
            thread.pathContainer = {
                isEmpty: jest.fn(),
                redo: jest.fn().mockReturnValue(false),
                getAxisAlignedBoundingBox: jest.fn()
            };
        });

        it('should do nothing when the path container fails to redo', () => {
            thread.redo();
            expect(thread.pathContainer.redo).toBeCalled();
            expect(thread.draw).not.toBeCalled();
            expect(thread.emitAvailableActions).not.toBeCalled();
        });

        it('should draw when the path container indicates a successful redo', () => {
            thread.pathContainer.redo = jest.fn().mockReturnValue(true);
            thread.redo();
            expect(thread.pathContainer.redo).toBeCalled();
            expect(thread.draw).toBeCalled();
            expect(thread.emitAvailableActions).toBeCalled();
        });
    });

    describe('draw()', () => {
        let context;

        beforeEach(() => {
            thread.pendingPath = {
                isEmpty: jest.fn(),
                drawPath: jest.fn()
            };
            thread.pathContainer = {
                applyToItems: jest.fn()
            };
            context = {
                clearRect: jest.fn(),
                beginPath: jest.fn(),
                stroke: jest.fn(),
                canvas: {
                    width: 1,
                    height: 2
                }
            };
        });

        it('should do nothing when context is null or undefined', () => {
            context = undefined;
            thread.draw(context);
            context = null;
            thread.draw(context);
            expect(thread.pathContainer.applyToItems).not.toBeCalled();
        });

        it('should draw the items in the path container when given a valid context', () => {
            thread.pendingPath.isEmpty = jest.fn().mockReturnValue(false);
            thread.draw(context);
            expect(context.beginPath).toBeCalled();
            expect(thread.pathContainer.applyToItems).toBeCalled();
            expect(thread.pendingPath.isEmpty).toBeCalled();
            expect(thread.pendingPath.drawPath).toBeCalled();
            expect(context.stroke).toBeCalled();
        });

        it('should clear the canvas when the flag is true', () => {
            thread.draw(context, true);
            expect(context.clearRect).toBeCalled();
        });

        it('should not clear the canvas when the flag is true', () => {
            thread.draw(context, false);
            expect(context.clearRect).not.toBeCalled();
        });
    });

    describe('emitAvailableActions()', () => {
        afterEach(() => {
            thread.removeAllListeners('threadevent');
        });

        it('should trigger an annotationevent with thenumber of available undo and redo actions', (done) => {
            const numItems = {
                undoCount: 3,
                redoCount: 2
            };
            thread.pathContainer = {
                getNumberOfItems: jest.fn().mockReturnValue(numItems)
            };
            thread.addListener('threadevent', (data) => {
                const { eventData } = data;
                expect(data.event).toEqual('availableactions');
                expect(eventData.undo).toEqual(numItems.undoCount);
                expect(eventData.redo).toEqual(numItems.redoCount);
                done();
            });

            thread.emitAvailableActions();
        });
    });

    describe('regenerateBoundary()', () => {
        it('should do nothing when no drawingPaths have been saved', () => {
            thread.location = {};

            thread.regenerateBoundary();
            expect(thread.minX).toBeUndefined();
            expect(thread.maxX).toBeUndefined();
            expect(thread.minY).toBeUndefined();
            expect(thread.maxY).toBeUndefined();
        });

        it('should set the boundary when the location has been assigned', () => {
            thread.location = {
                minX: 5,
                minY: 6,
                maxX: 7,
                maxY: 8
            };

            thread.regenerateBoundary();
            expect(thread.minX).toEqual(thread.location.minX);
            expect(thread.maxX).toEqual(thread.location.maxX);
            expect(thread.minY).toEqual(thread.location.minY);
            expect(thread.maxY).toEqual(thread.location.maxY);
        });
    });

    describe('clearBoundary()', () => {
        it('should clear the drawing context', () => {
            const boundaryEl = document.createElement('div');
            boundaryEl.classList.add('ba-drawing-boundary');
            rootElement.appendChild(boundaryEl);
            rootElement.removeChild = jest.fn();

            thread.clearBoundary();
            expect(rootElement.removeChild).toBeCalled();
        });
    });
});
