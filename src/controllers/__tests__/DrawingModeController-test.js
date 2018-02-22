import rbush from 'rbush';
import AnnotationModeController from '../AnnotationModeController';
import DrawingModeController from '../DrawingModeController';
import * as util from '../../util';
import {
    THREAD_EVENT,
    SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL,
    SELECTOR_ANNOTATION_BUTTON_DRAW_POST,
    SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO,
    SELECTOR_ANNOTATION_BUTTON_DRAW_REDO,
    SELECTOR_DRAW_MODE_HEADER,
    CLASS_ANNOTATION_MODE,
    CLASS_ACTIVE,
    CONTROLLER_EVENT
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
            addListener: sandbox.stub(),
            removeListener: sandbox.stub(),
            saveAnnotation: sandbox.stub(),
            handleStart: sandbox.stub(),
            destroy: sandbox.stub(),
            deleteThread: sandbox.stub(),
            show: sandbox.stub()
        };

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
            controller['localized'] = {
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

        it('should unbind the mobileDOM listeners', () => {
            controller.isMobile = true;
            controller.hasTouch = true;
            controller.bindDOMListeners();
            expect(stubs.add).to.be.calledWith('touchstart', sinon.match.func);
        });

        it('should unbind the DOM listeners', () => {
            controller.isMobile = true;
            controller.hasTouch = false;
            controller.bindDOMListeners();
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

        it('should unbind the mobileDOM listeners', () => {
            controller.isMobile = true;
            controller.hasTouch = true;
            controller.unbindDOMListeners();
            expect(stubs.remove).to.be.calledWith('touchstart', sinon.match.func);
        });

        it('should unbind the DOM listeners', () => {
            controller.isMobile = true;
            controller.hasTouch = false;
            controller.unbindDOMListeners();
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
            controller.annotator = {
                getThreadParams: sandbox.stub(),
                getLocationFromEvent: sandbox.stub()
            };
            controller.annotatedElement = {};
            stubs.getParams = controller.annotator.getThreadParams.returns({});
            stubs.getLocation = controller.annotator.getLocationFromEvent;

            controller.postButtonEl = 'not undefined';
            controller.undoButtonEl = 'also not undefined';
            controller.redoButtonEl = 'additionally not undefined';
            controller.cancelButtonEl = 'definitely not undefined';

            controller.setupHandlers();
            expect(stubs.getParams).to.be.called;
            expect(controller.handlers.length).to.equal(7);
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
            controller.handleThreadEvents(stubs.thread, {
                event: 'softcommit'
            });
            expect(controller.unbindListeners).to.not.be.called;
            expect(controller.bindListeners).to.not.be.called;
            expect(stubs.thread.handleStart).to.not.be.called;
            expect(controller.saveThread).to.be.called;
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
                saveAnnotation: sandbox.stub()
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
        });

        it('should update undo and redo buttons on availableactions', () => {
            controller.handleThreadEvents(stubs.thread, {
                event: 'availableactions',
                eventData: {
                    undo: 1,
                    redo: 2
                }
            });
            expect(controller.updateUndoRedoButtonEls).to.be.calledWith(1, 2);
        });

        it('should soft delete a pending thread and restart mode listeners', () => {
            stubs.thread.state = 'pending';
            controller.handleThreadEvents(stubs.thread, {
                event: 'dialogdelete'
            });
            expect(stubs.thread.destroy).to.be.called;
            expect(controller.unbindListeners).to.be.called;
            expect(controller.bindListeners).to.be.called;
        });

        it('should delete a non-pending thread', () => {
            stubs.thread.state = 'idle';
            controller.threads[1] = new rbush();
            controller.registerThread(stubs.thread);
            const unregisterThreadStub = sandbox.stub(controller, 'unregisterThread');

            controller.handleThreadEvents(stubs.thread, {
                event: 'dialogdelete'
            });
            expect(stubs.thread.deleteThread).to.be.called;
            expect(unregisterThreadStub).to.be.called;
        });

        it('should not delete a thread if the dialog no longer exists', () => {
            stubs.thread.dialog = null;
            controller.threads[1] = new rbush();
            controller.registerThread(stubs.thread);
            const unregisterThreadStub = sandbox.stub(controller, 'unregisterThread');

            controller.handleThreadEvents(stubs.thread, {
                event: 'dialogdelete'
            });
            expect(unregisterThreadStub).to.not.be.called;
        });
    });

    describe('handleSelection()', () => {
        beforeEach(() => {
            controller.threads[1] = new rbush();
            controller.registerThread(stubs.thread);
            stubs.intersecting = sandbox.stub(controller, 'getIntersectingThreads').returns([ stubs.thread ]);
            stubs.select = sandbox.stub(controller, 'select');
            stubs.clean = sandbox.stub(controller, 'removeSelection');

            stubs.event = {
                stopPropagation: sandbox.stub()
            };
        });

        it('should do nothing with an empty event', () => {
            controller.handleSelection();
            expect(stubs.intersecting).to.not.be.called;
        })

        it('should do nothing no intersecting threads are found', () => {
            stubs.intersecting.returns([]);
            controller.handleSelection(stubs.event);
            expect(stubs.clean).to.be.called;
            expect(stubs.select).to.not.be.called;
            expect(stubs.event.stopPropagation).to.be.called;
        });

        it('should call select on an thread found in the data store', () => {
            controller.handleSelection(stubs.event);
            expect(stubs.clean).to.be.called;
            expect(stubs.select).to.be.calledWith(stubs.thread);
            expect(stubs.event.stopPropagation).to.be.called;
        });
    });

    describe('renderPage()', () => {
        const thread = {
            threadID: '123abc',
            location: { page: 1 },
            show: () => {},
            addListener: () => {}
        };

        beforeEach(() => {
            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.setAttribute('data-page-number', 1);

            stubs.threadMock = sandbox.mock(thread);
            sandbox.stub(util, 'clearCanvas');
        });

        it('should do nothing if no threads exist or none are on the specified page', () => {
            stubs.threadMock.expects('show').never();
            controller.renderPage(1);

            controller.threads = {};
            controller.registerThread(thread);
            controller.renderPage(2);
            expect(util.clearCanvas).to.be.calledTwice;
        });

        it('should render the annotations on every page', () => {
            controller.threads = {};
            controller.registerThread(thread);
            stubs.threadMock.expects('show').once();
            controller.renderPage(1);
            expect(util.clearCanvas).to.be.called;
        });
    });

    describe('removeSelection()', () => {
        it('should clean a selected thread boundary', () => {
            const thread = {
                clearBoundary: sandbox.stub()
            };
            controller.selectedThread = thread;

            controller.removeSelection();
            expect(thread.clearBoundary).to.be.called;
            expect(controller.selectedThread).to.be.undefined;
        });
    });

    describe('select()', () => {
        it('should draw the boundary', () => {
            const thread = {
                drawBoundary: sandbox.stub()
            }

            expect(controller.selectedThread).to.not.deep.equal(thread);
            controller.select(thread);
            expect(thread.drawBoundary).to.be.called;
            expect(controller.selectedThread).to.deep.equal(thread);
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
});
