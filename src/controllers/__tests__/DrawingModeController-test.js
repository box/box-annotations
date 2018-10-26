/* eslint-disable no-unused-expressions */
import rbush from 'rbush';
import AnnotationModeController from '../AnnotationModeController';
import DrawingModeController from '../DrawingModeController';
import * as util from '../../util';
import {
    STATES,
    SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL,
    SELECTOR_ANNOTATION_BUTTON_DRAW_POST,
    SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO,
    SELECTOR_ANNOTATION_BUTTON_DRAW_REDO,
    SELECTOR_DRAW_MODE_HEADER,
    CLASS_ANNOTATION_MODE,
    CLASS_ACTIVE,
    THREAD_EVENT,
    CLASS_ANNOTATION_DRAW_MODE
} from '../../constants';
import DrawingThread from '../../drawing/DrawingThread';

jest.mock('../../drawing/DrawingThread');

let controller;
let thread;

const html = `<div class="annotated-element">
  <div data-page-number="1"></div>
  <div data-page-number="2"></div>
</div>`;

describe('controllers/DrawingModeController', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        controller = new DrawingModeController();
        thread = new DrawingThread();
        thread.minX = 10;
        thread.minY = 10;
        thread.maxX = 20;
        thread.maxY = 20;
        thread.location = { page: 1 };
        thread.info = 'I am a thread';
        thread.annotatedElement = rootElement;

        controller.emit = jest.fn();
        controller.annotatedElement = rootElement;
        controller.api = { user: {} };

        util.getPopoverLayer = jest.fn().mockReturnValue(rootElement);
        util.shouldDisplayMobileUI = jest.fn().mockReturnValue(false);
    });

    afterEach(() => {
        controller = null;
    });

    describe('init()', () => {
        beforeEach(() => {
            Object.defineProperty(AnnotationModeController.prototype, 'init', { value: jest.fn() });
            controller.setupHeader = jest.fn();
        });

        it('should replace the draw annotations header if using the preview header', () => {
            controller.init({ options: { header: 'light' } });
            expect(controller.setupHeader).toBeCalled();
        });
    });

    describe('setupHeader', () => {
        it('should setup header and get all the mode buttons', () => {
            const blankDiv = document.createElement('div');
            util.insertTemplate = jest.fn();
            controller.getButton = jest.fn().mockReturnValue(blankDiv);
            controller.localized = {
                cancelButton: 'cancel',
                doneButton: 'done'
            };

            controller.setupHeader(blankDiv, blankDiv);
            expect(controller.getButton).toBeCalledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL);
            expect(controller.getButton).toBeCalledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_POST);
            expect(controller.getButton).toBeCalledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO);
            expect(controller.getButton).toBeCalledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_REDO);
        });
    });

    describe('bindDOMListeners()', () => {
        beforeEach(() => {
            controller.annotatedElement.addEventListener = jest.fn();
        });

        it('should bind DOM listeners for desktop devices', () => {
            controller.hasTouch = false;
            controller.bindDOMListeners();
            expect(controller.annotatedElement.addEventListener).toBeCalledWith('click', expect.any(Function));
        });

        it('should bind DOM listeners for touch enabled devices', () => {
            controller.hasTouch = true;
            controller.bindDOMListeners();
            expect(controller.annotatedElement.addEventListener).toBeCalledWith('click', expect.any(Function));
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            controller.annotatedElement.removeEventListener = jest.fn();
        });

        it('should unbind DOM listeners for desktop devices', () => {
            controller.hasTouch = false;
            controller.unbindDOMListeners();
            expect(controller.annotatedElement.removeEventListener).toBeCalledWith('click', expect.any(Function));
        });

        it('should unbind DOM listeners for touch enabled devices', () => {
            controller.hasTouch = true;
            controller.unbindDOMListeners();
            expect(controller.annotatedElement.removeEventListener).toBeCalledWith('click', expect.any(Function));
        });
    });

    describe('bindListeners()', () => {
        it('should disable undo and redo buttons', () => {
            controller.unbindDOMListeners = jest.fn();
            const handlerObj = {
                type: 'event',
                func: jest.fn(),
                eventObj: {
                    addEventListener: jest.fn()
                }
            };
            controller.setupHandlers = jest.fn(() => {
                controller.handlers = [handlerObj];
            });
            expect(controller.handlers.length).toEqual(0);

            controller.bindListeners();
            expect(controller.unbindDOMListeners).toBeCalled();
        });
    });

    describe('unbindListeners()', () => {
        it('should disable undo and redo buttons', () => {
            util.disableElement = jest.fn();
            controller.bindDOMListeners = jest.fn();

            controller.annotatedElement = document.createElement('div');
            controller.undoButtonEl = 'test1';
            controller.redoButtonEl = 'test2';

            controller.unbindListeners();
            expect(util.disableElement).toBeCalledWith(controller.undoButtonEl);
            expect(util.disableElement).toBeCalledWith(controller.redoButtonEl);
            expect(controller.bindDOMListeners);
        });
    });

    describe('setupHandlers()', () => {
        it('should successfully contain draw mode handlers if undo and redo buttons exist', () => {
            controller.annotatedElement = {};
            controller.postButtonEl = 'not undefined';
            controller.undoButtonEl = 'also not undefined';
            controller.redoButtonEl = 'additionally not undefined';
            controller.cancelButtonEl = 'definitely not undefined';
            controller.pushElementHandler = jest.fn();

            controller.setupHandlers();
            expect(controller.pushElementHandler).toBeCalledWith(
                controller.annotatedElement,
                'click',
                expect.any(Function),
                true
            );
            expect(controller.pushElementHandler).toBeCalledWith(
                controller.postButtonEl,
                'click',
                expect.any(Function)
            );
            expect(controller.pushElementHandler).toBeCalledWith(
                controller.undoButtonEl,
                'click',
                expect.any(Function)
            );
            expect(controller.pushElementHandler).toBeCalledWith(
                controller.redoButtonEl,
                'click',
                expect.any(Function)
            );
            expect(controller.pushElementHandler).toBeCalledWith(
                controller.cancelButtonEl,
                'click',
                expect.any(Function)
            );
            expect(controller.pushElementHandler).toBeCalledWith(
                controller.annotatedElement,
                ['mousedown', 'touchstart'],
                expect.any(Function),
                true
            );
        });
    });

    describe('drawingStartHandler()', () => {
        const event = {
            stopPropagation: jest.fn(),
            preventDefault: jest.fn()
        };
        const location = {};

        beforeEach(() => {
            controller.getLocation = jest.fn();
            controller.currentThread = undefined;
            controller.locationFunction = jest.fn();
            controller.registerThread = jest.fn().mockReturnValue(thread);
        });

        afterEach(() => {
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
        });

        it('should do nothing if drawing start is invalid', () => {
            controller.drawingStartHandler(event);
            expect(controller.getLocation).toBeCalled();
            expect(controller.registerThread).not.toBeCalled();
        });

        it('should continue drawing if in the middle of creating a new drawing', () => {
            controller.currentThread = thread;
            controller.getLocation = jest.fn().mockReturnValue(location);
            thread.getThreadEventData = jest.fn().mockReturnValue({});

            controller.drawingStartHandler(event);
            expect(controller.registerThread).not.toBeCalled();
            expect(thread.handleStart).toBeCalledWith(location);
        });

        it('should begin a new drawing thread if none exist already', () => {
            controller.getLocation = jest.fn().mockReturnValue(location);
            controller.registerThread = jest.fn().mockReturnValue(thread);
            thread.getThreadEventData = jest.fn().mockReturnValue({});

            controller.drawingStartHandler(event);
            expect(controller.currentThread).not.toBeUndefined();
            expect(controller.emit).toBeCalledWith(THREAD_EVENT.pending, {});
            expect(thread.bindDrawingListeners).toBeCalledWith(controller.locationFunction);
            expect(thread.addListener).toBeCalledWith('threadevent', expect.any(Function));
            expect(thread.handleStart).toBeCalledWith(location);
        });
    });

    describe('enter()', () => {
        it('should enter annotation mode', () => {
            controller.bindListeners = jest.fn();
            util.replaceHeader = jest.fn();

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);

            controller.enter();
            expect(util.replaceHeader).toBeCalledWith(controller.container, SELECTOR_DRAW_MODE_HEADER);
        });
    });

    describe('handleThreadEvents()', () => {
        beforeEach(() => {
            controller.unbindListeners = jest.fn();
            controller.bindListeners = jest.fn();
            controller.registerThread = jest.fn();
            controller.updateUndoRedoButtonEls = jest.fn();
            controller.unregisterThread = jest.fn();
            util.clearCanvas = jest.fn();
            controller.annotations = {};
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_DRAW_MODE);
        });

        it('should save thread on annotationsaved', () => {
            controller.handleThreadEvents(thread, {
                event: THREAD_EVENT.save
            });
            expect(controller.unbindListeners).toBeCalled();
            expect(controller.bindListeners).toBeCalled();
            expect(controller.registerThread).toBeCalled();
            expect(controller.currentThread).toBeUndefined();
            expect(thread.handleStart).not.toBeCalled();
            expect(thread.removeListener).toBeCalledWith('threadevent', expect.any(Function));
            expect(thread.unbindDrawingListeners).toBeCalled();
        });

        it('should soft delete a pending thread and restart mode listeners', () => {
            thread.state = 'pending';
            controller.handleThreadEvents(thread, {
                event: THREAD_EVENT.delete
            });
            expect(controller.unbindListeners).toBeCalled();
            expect(controller.bindListeners).toBeCalled();
            expect(controller.currentThread).toBeUndefined();
            expect(thread.destroy).toBeCalled();
            expect(thread.removeListener).toBeCalledWith('threadevent', expect.any(Function));
            expect(thread.unbindDrawingListeners).toBeCalled();
        });

        it('should delete a non-pending thread', () => {
            thread.state = 'inactive';
            // eslint-disable-next-line new-cap
            controller.annotations[1] = new rbush();

            controller.handleThreadEvents(thread, {
                event: THREAD_EVENT.delete
            });
            expect(controller.unregisterThread).toBeCalled();
            expect(controller.currentThread).toBeUndefined();
            expect(thread.removeListener).toBeCalledWith('threadevent', expect.any(Function));
            expect(thread.unbindDrawingListeners).toBeCalled();
        });

        it('should not delete a thread if the dialog no longer exists', () => {
            // eslint-disable-next-line new-cap
            controller.annotations[1] = new rbush();
            thread.state = 'pending';

            controller.handleThreadEvents(thread, {
                event: THREAD_EVENT.delete
            });
            expect(controller.unbindListeners).toBeCalled();
            expect(controller.bindListeners).toBeCalled();
            expect(thread.destroy).toBeCalled();
        });
    });

    describe('handleSelection()', () => {
        let event;

        beforeEach(() => {
            // eslint-disable-next-line new-cap
            controller.annotations[1] = new rbush(thread);
            controller.removeSelection = jest.fn();
            controller.select = jest.fn();
            controller.getIntersectingThreads = jest.fn().mockReturnValue([thread]);

            event = {
                stopPropagation: jest.fn()
            };
        });

        it('should do nothing with an empty event', () => {
            controller.handleSelection();
            expect(controller.getIntersectingThreads).not.toBeCalled();
        });

        it('should do nothing no intersecting threads are found', () => {
            controller.getIntersectingThreads = jest.fn().mockReturnValue([]);
            controller.handleSelection(event);
            expect(controller.removeSelection).toBeCalled();
            expect(controller.select).not.toBeCalled();
            expect(event.stopPropagation).toBeCalled();
        });

        it('should do nothing with while drawing a new annotation event', () => {
            controller.currentThread = new DrawingThread();
            controller.currentThread.state = STATES.pending;
            controller.handleSelection(event);
            expect(controller.getIntersectingThreads).not.toBeCalled();
        });

        it('should call select on an thread found in the data store', () => {
            controller.handleSelection(event);
            expect(controller.removeSelection).toBeCalled();
            expect(controller.select).toBeCalledWith(thread);
            expect(event.stopPropagation).toBeCalled();
        });
    });

    describe('renderPage()', () => {
        it('should clear both canvases on the specified page', () => {
            util.clearCanvas = jest.fn();
            controller.annotations = {
                // eslint-disable-next-line new-cap
                1: new rbush()
            };
            controller.renderPage(1);
            expect(util.clearCanvas).toBeCalledTwice;
        });
    });

    describe('removeSelection()', () => {
        it('should clean a selected thread boundary', () => {
            controller.selectedThread = thread;
            thread.clearBoundary = jest.fn();
            controller.removeSelection();
            expect(controller.selectedThread).toBeUndefined();
        });
    });

    describe('select()', () => {
        it('should draw the boundary', () => {
            thread.drawBoundary = jest.fn();
            expect(controller.selectedThread).not.toStrictEqual(thread);
            controller.select(thread);
            expect(controller.selectedThread).toStrictEqual(thread);
        });
    });

    describe('updateUndoRedoButtonEls()', () => {
        beforeEach(() => {
            controller.undoButtonEl = 'undo';
            controller.redoButtonEl = 'redo';
            util.enableElement = jest.fn();
            util.disableElement = jest.fn();
        });

        it('should disable both when the counts are 0', () => {
            controller.updateUndoRedoButtonEls(0, 0);
            expect(util.disableElement).toBeCalledWith(controller.undoButtonEl);
            expect(util.disableElement).toBeCalledWith(controller.redoButtonEl);
            expect(util.enableElement).not.toBeCalled();
        });

        it('should enable both when the counts are 1', () => {
            controller.updateUndoRedoButtonEls(1, 1);
            expect(util.enableElement).toBeCalledWith(controller.undoButtonEl);
            expect(util.enableElement).toBeCalledWith(controller.redoButtonEl);
            expect(util.disableElement).not.toBeCalled();
        });

        it('should enable undo and do nothing for redo', () => {
            controller.updateUndoRedoButtonEls(1, 2);
            expect(util.enableElement).toBeCalledWith(controller.undoButtonEl);
            expect(util.disableElement).not.toBeCalled();
        });
    });
});
