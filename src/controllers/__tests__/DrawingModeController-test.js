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
let stubs = {};
const sandbox = sinon.sandbox.create();

describe('controllers/DrawingModeController', () => {
    beforeEach(() => {
        controller = new DrawingModeController();
        stubs.thread = {
            minX: 10,
            minY: 10,
            maxX: 20,
            maxY: 20,
            location: {
                page: 1
            },
            info: 'I am a thread',
            addListener: () => {},
            removeListener: () => {},
            saveAnnotation: () => {},
            handleStart: () => {},
            destroy: () => {},
            deleteThread: () => {},
            clearBoundary: () => {},
            drawBoundary: () => {},
            bindDrawingListeners: () => {},
            unbindDrawingListeners: () => {},
            getThreadEventData: () => {},
            show: () => {}
        };
        stubs.threadMock = sandbox.mock(stubs.thread);

        sandbox.stub(controller, 'emit');
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        stubs = {};
        controller = null;
    });

    describe('init()', () => {
        beforeEach(() => {
            Object.defineProperty(AnnotationModeController.prototype, 'init', { value: sandbox.stub() });
            sandbox.stub(controller, 'setupHeader');
        });

        it('should replace the draw annotations header if using the preview header', () => {
            controller.init({ options: { header: 'light' } });
            expect(controller.setupHeader).to.be.called;
        });
    });

    describe('setupHeader', () => {
        it('should setup header and get all the mode buttons', () => {
            const blankDiv = document.createElement('div');
            stubs.insertTemplate = sandbox.stub(util, 'insertTemplate');
            sandbox.stub(controller, 'getButton').returns(blankDiv);
            controller.localized = {
                cancelButton: 'cancel',
                doneButton: 'done'
            };

            controller.setupHeader(blankDiv, blankDiv);
            expect(controller.getButton).to.be.calledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL);
            expect(controller.getButton).to.be.calledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_POST);
            expect(controller.getButton).to.be.calledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO);
            expect(controller.getButton).to.be.calledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_REDO);
        });
    });

    describe('bindDOMListeners()', () => {
        beforeEach(() => {
            controller.annotatedElement = {
                addEventListener: sandbox.stub()
            };
            stubs.add = controller.annotatedElement.addEventListener;
        });

        it('should bind DOM listeners for desktop devices', () => {
            controller.isMobile = false;
            controller.hasTouch = false;
            controller.bindDOMListeners();
            expect(stubs.add).to.be.calledWith('click', sinon.match.func);
            expect(stubs.add).to.not.be.calledWith('touchstart', sinon.match.func);
        });

        it('should bind DOM listeners for touch enabled mobile devices', () => {
            controller.isMobile = true;
            controller.hasTouch = true;
            controller.bindDOMListeners();
            expect(stubs.add).to.be.calledWith('touchstart', sinon.match.func);
            expect(stubs.add).to.not.be.calledWith('click', sinon.match.func);
        });

        it('should bind ALL DOM listeners for touch enabled desktop devices', () => {
            controller.isMobile = false;
            controller.hasTouch = true;
            controller.bindDOMListeners();
            expect(stubs.add).to.be.calledWith('touchstart', sinon.match.func);
            expect(stubs.add).to.be.calledWith('click', sinon.match.func);
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            controller.annotatedElement = {
                removeEventListener: sandbox.stub()
            };
            stubs.remove = controller.annotatedElement.removeEventListener;
        });

        it('should unbind DOM listeners for desktop devices', () => {
            controller.isMobile = false;
            controller.hasTouch = false;
            controller.unbindDOMListeners();
            expect(stubs.remove).to.be.calledWith('click', sinon.match.func);
            expect(stubs.remove).to.not.be.calledWith('touchstart', sinon.match.func);
        });

        it('should unbind DOM listeners for touch enabled mobile devices', () => {
            controller.isMobile = true;
            controller.hasTouch = true;
            controller.unbindDOMListeners();
            expect(stubs.remove).to.be.calledWith('touchstart', sinon.match.func);
            expect(stubs.remove).to.not.be.calledWith('click', sinon.match.func);
        });

        it('should unbind ALL DOM listeners for touch enabled desktop devices', () => {
            controller.isMobile = false;
            controller.hasTouch = true;
            controller.unbindDOMListeners();
            expect(stubs.remove).to.be.calledWith('touchstart', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('click', sinon.match.func);
        });
    });

    describe('bindListeners()', () => {
        it('should disable undo and redo buttons', () => {
            sandbox.stub(controller, 'unbindDOMListeners');
            const handlerObj = {
                type: 'event',
                func: () => {},
                eventObj: {
                    addEventListener: sandbox.stub()
                }
            };
            sandbox.stub(controller, 'setupHandlers').callsFake(() => {
                controller.handlers = [handlerObj];
            });
            expect(controller.handlers.length).to.equal(0);

            controller.bindListeners();
            expect(controller.unbindDOMListeners).to.be.called;
        });
    });

    describe('unbindListeners()', () => {
        it('should disable undo and redo buttons', () => {
            sandbox.stub(util, 'disableElement');
            sandbox.stub(controller, 'bindDOMListeners');

            controller.annotatedElement = document.createElement('div');
            controller.undoButtonEl = 'test1';
            controller.redoButtonEl = 'test2';

            controller.unbindListeners();
            expect(util.disableElement).to.be.calledWith(controller.undoButtonEl);
            expect(util.disableElement).to.be.calledWith(controller.redoButtonEl);
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

            controller.setupHandlers();
            expect(controller.handlers.length).to.equal(5);
        });
    });

    describe('drawingStartHandler()', () => {
        const event = {
            stopPropagation: () => {},
            preventDefault: () => {}
        };
        const eventMock = sandbox.mock(event);
        const location = {};

        beforeEach(() => {
            controller.annotator = {
                getLocationFromEvent: () => {},
                createAnnotationThread: () => {}
            };
            stubs.annotatorMock = sandbox.mock(controller.annotator);
            controller.currentThread = undefined;
            controller.locationFunction = sandbox.stub();

            eventMock.expects('stopPropagation');
            eventMock.expects('preventDefault');
        });

        it('should do nothing if drawing start is invalid', () => {
            stubs.annotatorMock.expects('getLocationFromEvent');
            stubs.annotatorMock.expects('createAnnotationThread').never();
            controller.drawingStartHandler(event);
        });

        it('should continue drawing if in the middle of creating a new drawing', () => {
            controller.currentThread = stubs.thread;
            stubs.threadMock.expects('handleStart').withArgs(location);
            stubs.annotatorMock.expects('getLocationFromEvent').returns(location);
            stubs.annotatorMock.expects('createAnnotationThread').never();
            controller.drawingStartHandler(event);
        });

        it('should begin a new drawing thread if none exist already', () => {
            stubs.annotatorMock.expects('getLocationFromEvent').returns(location);
            stubs.annotatorMock.expects('createAnnotationThread').returns(stubs.thread);
            stubs.threadMock.expects('bindDrawingListeners').withArgs(controller.locationFunction);
            stubs.threadMock.expects('addListener').withArgs('threadevent', sinon.match.func);
            stubs.threadMock.expects('handleStart').withArgs(location);
            stubs.threadMock.expects('getThreadEventData').returns({});

            controller.drawingStartHandler(event);
            expect(controller.currentThread).to.not.be.undefined;
            expect(controller.emit).to.be.calledWith(THREAD_EVENT.pending, {});
        });
    });

    describe('enter()', () => {
        it('should enter annotation mode', () => {
            sandbox.stub(controller, 'bindListeners');
            sandbox.stub(util, 'replaceHeader');

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);

            controller.enter();
            expect(util.replaceHeader).to.be.calledWith(controller.container, SELECTOR_DRAW_MODE_HEADER);
        });
    });

    describe('handleThreadEvents()', () => {
        beforeEach(() => {
            stubs.thread.dialog = {};

            sandbox.stub(controller, 'unbindListeners');
            stubs.bind = sandbox.stub(controller, 'bindListeners');
            sandbox.stub(controller, 'saveThread');
            sandbox.stub(controller, 'registerThread');
            sandbox.stub(controller, 'updateUndoRedoButtonEls');
        });

        it('should save thread on softcommit', () => {
            stubs.threadMock.expects('handleStart').never();
            stubs.threadMock.expects('removeListener').withArgs('threadevent', sinon.match.func);
            stubs.threadMock.expects('unbindDrawingListeners');
            controller.handleThreadEvents(stubs.thread, {
                event: 'softcommit'
            });
            expect(controller.unbindListeners).to.be.called;
            expect(controller.bindListeners).to.be.called;
            expect(controller.saveThread).to.be.called;
            expect(controller.currentThread).to.be.undefined;
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
                saveAnnotation: sandbox.stub(),
                removeListener: sandbox.stub(),
                unbindDrawingListeners: sandbox.stub()
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
                handleStart: sandbox.stub()
            };
            const data = {
                event: 'softcommit',
                eventData: {
                    location: 'not empty'
                }
            };
            stubs.bind.callsFake(() => {
                controller.currentThread = thread2;
            });

            controller.handleThreadEvents(thread1, data);
            expect(controller.saveThread).to.be.called;
            expect(controller.unbindListeners).to.be.called;
            expect(controller.bindListeners).to.be.called;
            expect(thread2.handleStart).to.be.calledWith(data.eventData.location);
            expect(controller.currentThread).to.not.be.undefined;
        });

        it('should soft delete a pending thread and restart mode listeners', () => {
            stubs.thread.state = 'pending';
            stubs.threadMock.expects('destroy');
            stubs.threadMock.expects('removeListener').withArgs('threadevent', sinon.match.func);
            stubs.threadMock.expects('unbindDrawingListeners');
            controller.handleThreadEvents(stubs.thread, {
                event: 'dialogdelete'
            });
            expect(controller.unbindListeners).to.be.called;
            expect(controller.bindListeners).to.be.called;
            expect(controller.currentThread).to.be.undefined;
        });

        it('should delete a non-pending thread', () => {
            stubs.thread.state = 'idle';
            // eslint-disable-next-line new-cap
            controller.threads[1] = new rbush();
            controller.registerThread(stubs.thread);
            const unregisterThreadStub = sandbox.stub(controller, 'unregisterThread');

            stubs.threadMock.expects('deleteThread');
            stubs.threadMock.expects('removeListener').withArgs('threadevent', sinon.match.func);
            stubs.threadMock.expects('unbindDrawingListeners');
            controller.handleThreadEvents(stubs.thread, {
                event: 'dialogdelete'
            });
            expect(unregisterThreadStub).to.be.called;
            expect(controller.currentThread).to.be.undefined;
        });

        it('should not delete a thread if the dialog no longer exists', () => {
            stubs.thread.dialog = null;
            // eslint-disable-next-line new-cap
            controller.threads[1] = new rbush();
            controller.registerThread(stubs.thread);
            const unregisterThreadStub = sandbox.stub(controller, 'unregisterThread');
            stubs.threadMock.expects('removeListener').never();
            stubs.threadMock.expects('unbindDrawingListeners').never();

            controller.handleThreadEvents(stubs.thread, {
                event: 'dialogdelete'
            });
            expect(unregisterThreadStub).to.not.be.called;
        });
    });

    describe('handleSelection()', () => {
        beforeEach(() => {
            // eslint-disable-next-line new-cap
            controller.threads[1] = new rbush();
            controller.registerThread(stubs.thread);
            stubs.intersecting = sandbox.stub(controller, 'getIntersectingThreads').returns([stubs.thread]);
            stubs.select = sandbox.stub(controller, 'select');
            stubs.clean = sandbox.stub(controller, 'removeSelection');

            stubs.event = {
                stopPropagation: sandbox.stub()
            };
        });

        it('should do nothing with an empty event', () => {
            controller.handleSelection();
            expect(stubs.intersecting).to.not.be.called;
        });

        it('should do nothing no intersecting threads are found', () => {
            stubs.intersecting.returns([]);
            controller.handleSelection(stubs.event);
            expect(stubs.clean).to.be.called;
            expect(stubs.select).to.not.be.called;
            expect(stubs.event.stopPropagation).to.be.called;
        });

        it('should do nothing with while drawing a new annotation event', () => {
            controller.currentThread = { state: STATES.pending };
            controller.handleSelection(stubs.event);
            expect(stubs.intersecting).to.not.be.called;
        });

        it('should call select on an thread found in the data store', () => {
            controller.handleSelection(stubs.event);
            expect(stubs.clean).to.be.called;
            expect(stubs.select).to.be.calledWith(stubs.thread);
            expect(stubs.event.stopPropagation).to.be.called;
        });
    });

    describe('renderPage()', () => {
        beforeEach(() => {
            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.setAttribute('data-page-number', 1);
            sandbox.stub(util, 'clearCanvas');
        });

        it('should do nothing if no threads exist or none are on the specified page', () => {
            stubs.threadMock.expects('show').never();
            controller.renderPage(1);

            controller.threads = {};
            controller.registerThread(stubs.thread);
            controller.renderPage(2);
            expect(util.clearCanvas).to.be.calledTwice;
        });

        it('should render the annotations on every page', () => {
            controller.threads = {};
            controller.registerThread(stubs.thread);
            stubs.threadMock.expects('show').once();
            controller.renderPage(1);
            expect(util.clearCanvas).to.be.called;
        });
    });

    describe('removeSelection()', () => {
        it('should clean a selected thread boundary', () => {
            controller.selectedThread = stubs.thread;
            stubs.threadMock.expects('clearBoundary');
            controller.removeSelection();
            expect(controller.selectedThread).to.be.undefined;
        });
    });

    describe('select()', () => {
        it('should draw the boundary', () => {
            stubs.threadMock.expects('drawBoundary');
            expect(controller.selectedThread).to.not.deep.equal(stubs.thread);
            controller.select(stubs.thread);
            expect(controller.selectedThread).to.deep.equal(stubs.thread);
        });
    });

    describe('updateUndoRedoButtonEls()', () => {
        beforeEach(() => {
            controller.undoButtonEl = 'undo';
            controller.redoButtonEl = 'redo';
            stubs.enable = sandbox.stub(util, 'enableElement');
            stubs.disable = sandbox.stub(util, 'disableElement');
        });

        it('should disable both when the counts are 0', () => {
            controller.updateUndoRedoButtonEls(0, 0);
            expect(stubs.disable).be.calledWith(controller.undoButtonEl);
            expect(stubs.disable).be.calledWith(controller.redoButtonEl);
            expect(stubs.enable).to.not.be.called;
        });

        it('should enable both when the counts are 1', () => {
            controller.updateUndoRedoButtonEls(1, 1);
            expect(stubs.enable).be.calledWith(controller.undoButtonEl);
            expect(stubs.enable).be.calledWith(controller.redoButtonEl);
            expect(stubs.disable).to.not.be.called;
        });

        it('should enable undo and do nothing for redo', () => {
            controller.updateUndoRedoButtonEls(1, 2);
            expect(stubs.enable).be.calledWith(controller.undoButtonEl).once;
            expect(stubs.disable).to.not.be.called;
        });
    });

    describe('saveThread()', () => {
        beforeEach(() => {
            sandbox.stub(controller, 'registerThread');
        });

        it('should do nothing if thread has invalid boundary', () => {
            stubs.threadMock
                .expects('saveAnnotation')
                .withArgs(TYPES.draw)
                .never();
            controller.saveThread({ minX: NaN, minY: 1, maxX: 1, maxY: 1 });
            controller.saveThread({ type: TYPES.draw });
            expect(controller.registerThread).to.not.be.called;
        });

        it('should save and register the annotation thread', () => {
            stubs.threadMock.expects('saveAnnotation').withArgs(TYPES.draw);
            controller.saveThread(stubs.thread);
            expect(controller.registerThread).to.be.called;
        });
    });
});
