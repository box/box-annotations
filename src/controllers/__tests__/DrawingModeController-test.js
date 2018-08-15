/* eslint-disable no-unused-expressions */
import rbush from 'rbush';
import AnnotationModeController from '../AnnotationModeController';
import DrawingModeController from '../DrawingModeController';
import * as util from '../../util';
import {
    TYPES,
    STATES,
    SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL,
    SELECTOR_ANNOTATION_BUTTON_DRAW_POST,
    SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO,
    SELECTOR_ANNOTATION_BUTTON_DRAW_REDO,
    SELECTOR_DRAW_MODE_HEADER,
    CLASS_ANNOTATION_MODE,
    CLASS_ACTIVE,
    THREAD_EVENT
} from '../../constants';

let controller;
let thread;

describe('controllers/DrawingModeController', () => {
    beforeEach(() => {
        controller = new DrawingModeController();
        thread = {
            minX: 10,
            minY: 10,
            maxX: 20,
            maxY: 20,
            location: {
                page: 1
            },
            info: 'I am a thread',
            addListener: jest.fn(),
            removeListener: jest.fn(),
            saveAnnotation: jest.fn(),
            handleStart: jest.fn(),
            destroy: jest.fn(),
            deleteThread: jest.fn(),
            clearBoundary: jest.fn(),
            drawBoundary: jest.fn(),
            bindDrawingListeners: jest.fn(),
            unbindDrawingListeners: jest.fn(),
            getThreadEventData: jest.fn(),
            show: jest.fn()
        };
        controller.emit = jest.fn();
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
            controller.annotatedElement = {
                addEventListener: jest.fn()
            };
        });

        it('should bind DOM listeners for desktop devices', () => {
            controller.isMobile = false;
            controller.hasTouch = false;
            controller.bindDOMListeners();
            expect(controller.annotatedElement.addEventListener).toBeCalledWith('click', expect.any(Function));
            expect(controller.annotatedElement.addEventListener).not.toBeCalledWith('touchstart', expect.any(Function));
        });

        it('should bind DOM listeners for touch enabled mobile devices', () => {
            controller.isMobile = true;
            controller.hasTouch = true;
            controller.bindDOMListeners();
            expect(controller.annotatedElement.addEventListener).toBeCalledWith('touchstart', expect.any(Function));
            expect(controller.annotatedElement.addEventListener).not.toBeCalledWith('click', expect.any(Function));
        });

        it('should bind ALL DOM listeners for touch enabled desktop devices', () => {
            controller.isMobile = false;
            controller.hasTouch = true;
            controller.bindDOMListeners();
            expect(controller.annotatedElement.addEventListener).toBeCalledWith('touchstart', expect.any(Function));
            expect(controller.annotatedElement.addEventListener).toBeCalledWith('click', expect.any(Function));
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            controller.annotatedElement = {
                removeEventListener: jest.fn()
            };
        });

        it('should unbind DOM listeners for desktop devices', () => {
            controller.isMobile = false;
            controller.hasTouch = false;
            controller.unbindDOMListeners();
            expect(controller.annotatedElement.removeEventListener).toBeCalledWith('click', expect.any(Function));
            expect(controller.annotatedElement.removeEventListener).not.toBeCalledWith(
                'touchstart',
                expect.any(Function)
            );
        });

        it('should unbind DOM listeners for touch enabled mobile devices', () => {
            controller.isMobile = true;
            controller.hasTouch = true;
            controller.unbindDOMListeners();
            expect(controller.annotatedElement.removeEventListener).toBeCalledWith('touchstart', expect.any(Function));
            expect(controller.annotatedElement.removeEventListener).not.toBeCalledWith('click', expect.any(Function));
        });

        it('should unbind ALL DOM listeners for touch enabled desktop devices', () => {
            controller.isMobile = false;
            controller.hasTouch = true;
            controller.unbindDOMListeners();
            expect(controller.annotatedElement.removeEventListener).toBeCalledWith('touchstart', expect.any(Function));
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
            controller.annotator = {
                getLocationFromEvent: jest.fn(),
                createAnnotationThread: jest.fn()
            };
            controller.currentThread = undefined;
            controller.locationFunction = jest.fn();
        });

        afterEach(() => {
            expect(event.stopPropagation).toBeCalled();
            expect(event.preventDefault).toBeCalled();
        });

        it('should do nothing if drawing start is invalid', () => {
            controller.drawingStartHandler(event);
            expect(controller.annotator.getLocationFromEvent).toBeCalled();
            expect(controller.annotator.createAnnotationThread).not.toBeCalled();
        });

        it('should continue drawing if in the middle of creating a new drawing', () => {
            controller.currentThread = thread;
            controller.annotator.getLocationFromEvent = jest.fn().mockReturnValue(location);
            thread.getThreadEventData = jest.fn().mockReturnValue({});

            controller.drawingStartHandler(event);
            expect(controller.annotator.createAnnotationThread).not.toBeCalled();
            expect(thread.handleStart).toBeCalledWith(location);
        });

        it('should begin a new drawing thread if none exist already', () => {
            controller.annotator.getLocationFromEvent = jest.fn().mockReturnValue(location);
            controller.annotator.createAnnotationThread = jest.fn().mockReturnValue(thread);
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
            thread.dialog = {};

            controller.unbindListeners = jest.fn();
            controller.bindListeners = jest.fn();
            controller.saveThread = jest.fn();
            controller.registerThread = jest.fn();
            controller.updateUndoRedoButtonEls = jest.fn();
            controller.unregisterThread = jest.fn();

            controller.annotatedElement = document.createElement('div');
        });

        it('should save thread on softcommit', () => {
            controller.handleThreadEvents(thread, {
                event: 'softcommit'
            });
            expect(controller.unbindListeners).toBeCalled();
            expect(controller.bindListeners).toBeCalled();
            expect(controller.saveThread).toBeCalled();
            expect(controller.currentThread).toBeUndefined();
            expect(thread.handleStart).not.toBeCalled();
            expect(thread.removeListener).toBeCalledWith('threadevent', expect.any(Function));
            expect(thread.unbindDrawingListeners).toBeCalled();
        });

        it('should start a new thread on pagechanged', () => {
            const thread1 = {
                minX: 10,
                minY: 10,
                maxX: 20,
                maxY: 20,
                location: {
                    page: 1
                },
                info: 'I am a thread',
                saveAnnotation: jest.fn(),
                removeListener: jest.fn(),
                unbindDrawingListeners: jest.fn()
            };
            const thread2 = {
                minX: 10,
                minY: 10,
                maxX: 20,
                maxY: 20,
                location: {
                    page: 1
                },
                info: 'I am a thread',
                handleStart: jest.fn()
            };
            const data = {
                event: 'softcommit',
                eventData: {
                    location: 'not empty'
                }
            };
            controller.bindListeners = jest.fn(() => {
                controller.currentThread = thread2;
            });

            controller.handleThreadEvents(thread1, data);
            expect(controller.saveThread).toBeCalled();
            expect(controller.unbindListeners).toBeCalled();
            expect(controller.bindListeners).toBeCalled();
            expect(thread2.handleStart).toBeCalledWith(data.eventData.location);
            expect(controller.currentThread).not.toBeUndefined();
        });

        it('should soft delete a pending thread and restart mode listeners', () => {
            thread.state = 'pending';
            controller.handleThreadEvents(thread, {
                event: 'dialogdelete'
            });
            expect(controller.unbindListeners).toBeCalled();
            expect(controller.bindListeners).toBeCalled();
            expect(controller.currentThread).toBeUndefined();
            expect(thread.destroy).toBeCalled();
            expect(thread.removeListener).toBeCalledWith('threadevent', expect.any(Function));
            expect(thread.unbindDrawingListeners).toBeCalled();
        });

        it('should delete a non-pending thread', () => {
            thread.state = 'idle';
            // eslint-disable-next-line new-cap
            controller.threads[1] = new rbush();
            controller.registerThread(thread);

            controller.handleThreadEvents(thread, {
                event: 'dialogdelete'
            });
            expect(controller.unregisterThread).toBeCalled();
            expect(controller.currentThread).toBeUndefined();
            expect(thread.deleteThread).toBeCalled();
            expect(thread.removeListener).toBeCalledWith('threadevent', expect.any(Function));
            expect(thread.unbindDrawingListeners).toBeCalled();
        });

        it('should not delete a thread if the dialog no longer exists', () => {
            thread.dialog = null;
            // eslint-disable-next-line new-cap
            controller.threads[1] = new rbush();
            controller.registerThread(thread);

            controller.handleThreadEvents(thread, {
                event: 'dialogdelete'
            });
            expect(controller.unregisterThread).not.toBeCalled();
            expect(thread.removeListener).not.toBeCalled();
            expect(thread.unbindDrawingListeners).not.toBeCalled();
        });
    });

    describe('handleSelection()', () => {
        let event;

        beforeEach(() => {
            // eslint-disable-next-line new-cap
            controller.threads[1] = new rbush();
            controller.registerThread(thread);
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
            controller.currentThread = { state: STATES.pending };
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
        beforeEach(() => {
            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.setAttribute('data-page-number', 1);
            util.clearCanvas = jest.fn();
        });

        it('should do nothing if no threads exist or none are on the specified page', () => {
            controller.renderPage(1);

            controller.threads = {};
            controller.registerThread(thread);
            controller.renderPage(2);
            expect(util.clearCanvas).toBeCalledTwice;
            expect(thread.show).not.toBeCalled();
        });

        it('should render the annotations on every page', () => {
            controller.threads = {};
            controller.registerThread(thread);
            controller.renderPage(1);
            expect(util.clearCanvas).toBeCalled();
            expect(thread.show).toHaveBeenCalledTimes(1);
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

    describe('saveThread()', () => {
        it('should do nothing if thread has invalid boundary', () => {
            controller.registerThread = jest.fn();
            controller.saveThread({ minX: NaN, minY: 1, maxX: 1, maxY: 1 });
            controller.saveThread({ type: TYPES.draw });
            expect(controller.registerThread).not.toBeCalled();
            expect(thread.saveAnnotation).not.toBeCalledWith(TYPES.draw);
        });

        it('should save and register the annotation thread', () => {
            controller.registerThread = jest.fn();
            controller.saveThread(thread);
            expect(controller.registerThread).toBeCalled();
            expect(thread.saveAnnotation).toBeCalledWith(TYPES.draw);
        });
    });
});
