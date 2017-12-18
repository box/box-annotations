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
    CLASS_ANNNOTATION_DRAWING_BACKGROUND,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    CLASS_ANNOTATION_LAYER_DRAW,
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
            sandbox.stub(controller, 'getButton');
            sandbox.stub(controller, 'setupHeader');
        });

        it('should get all the mode buttons and initialize the controller', () => {
            controller.init({ options: { header: 'none' } });
            expect(controller.setupHeader).to.not.be.called;
            expect(controller.getButton).to.be.calledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL);
            expect(controller.getButton).to.be.calledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_POST);
            expect(controller.getButton).to.be.calledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO);
            expect(controller.getButton).to.be.calledWith(SELECTOR_ANNOTATION_BUTTON_DRAW_REDO);
        });

        it('should replace the draw annotations header if using the preview header', () => {
            controller.init({ options: { header: 'light' } });
            expect(controller.setupHeader).to.be.called;
        });
    });

    describe('exit()', () => {
        it('should exit draw annotation mode', () => {
            sandbox.stub(controller, 'unbindListeners');

            // Set up draw annotation mode
            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
            controller.annotatedElement.classList.add(CLASS_ANNNOTATION_DRAWING_BACKGROUND);

            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);

            controller.exit();
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.exit, sinon.match.object);
            expect(controller.unbindListeners).to.be.called;
            expect(controller.emit).to.be.calledWith('binddomlisteners');
        });
    });

    describe('enter()', () => {
        it('should exit draw annotation mode', () => {
            sandbox.stub(controller, 'bindListeners');

            // Set up draw annotation mode
            controller.annotatedElement = document.createElement('div');
            controller.buttonEl = document.createElement('button');

            controller.enter();
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.enter, sinon.match.object);
            expect(controller.bindListeners).to.be.called;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.unbindDOMListeners);
        });
    });

    describe('registerThread()', () => {
        beforeEach(() => {
            controller.threads = { 1: new rbush() };
        });

        it('should do nothing if thread does not exist', () => {
            stubs.thread = undefined;
            controller.registerThread(stubs.thread);
            expect(controller.emit).to.not.be.calledWith(CONTROLLER_EVENT.register, sinon.match.object);
        });

        it('should do nothing if thread location does not exist', () => {
            stubs.thread.location = undefined;
            controller.registerThread(stubs.thread);
            expect(controller.emit).to.not.be.calledWith(CONTROLLER_EVENT.register, sinon.match.object);
        });

        it('should create new rbush for page if it does not already exist', () => {
            stubs.thread.location.page = 2;

            controller.registerThread(stubs.thread);

            const thread = controller.threads[2].search(stubs.thread);
            expect(thread.includes(stubs.thread)).to.be.truthy;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.register, sinon.match.object);
        });

        it('should internally keep track of the registered thread', () => {
            const pageThreads = controller.threads[1];
            expect(pageThreads.search(stubs.thread)).to.deep.equal([]);

            controller.registerThread(stubs.thread);
            const thread = pageThreads.search(stubs.thread);
            expect(thread.includes(stubs.thread)).to.be.truthy;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.register, sinon.match.object);
        });
    });

    describe('unregisterThread()', () => {
        beforeEach(() => {
            controller.threads = { 1: new rbush() };
            controller.registerThread(stubs.thread);
        });

        it('should do nothing if thread does not exist', () => {
            stubs.thread = undefined;
            controller.unregisterThread(stubs.thread);
            expect(controller.emit).to.not.be.calledWith(CONTROLLER_EVENT.unregister, sinon.match.object);
        });

        it('should do nothing if thread location does not exist', () => {
            stubs.thread.location = undefined;
            controller.unregisterThread(stubs.thread);
            expect(controller.emit).to.not.be.calledWith(CONTROLLER_EVENT.unregister, sinon.match.object);
        });

        it('should internally keep track of the registered thread', () => {
            const pageThreads = controller.threads[1];
            controller.unregisterThread(stubs.thread);
            const thread = pageThreads.search(stubs.thread);
            expect(thread.includes(stubs.thread)).to.be.falsy;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.unregister, sinon.match.object);
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
        beforeEach(() => {
            controller.annotator = {
                getThreadParams: sandbox.stub(),
                getLocationFromEvent: sandbox.stub()
            };
            controller.annotatedElement = {};
            stubs.getParams = controller.annotator.getThreadParams.returns({});
            stubs.getLocation = controller.annotator.getLocationFromEvent;
        });

        it('should successfully contain draw mode handlers if undo and redo buttons exist', () => {
            controller.postButtonEl = 'not undefined';
            controller.undoButtonEl = 'also not undefined';
            controller.redoButtonEl = 'additionally not undefined';
            controller.cancelButtonEl = 'definitely not undefined';


            controller.setupHandlers();
            expect(stubs.getParams).to.be.called;
            expect(controller.handlers.length).to.equal(7);
        });
    });

    describe('handleThreadEvents()', () => {
        beforeEach(() => {
            stubs.thread.dialog = {};
        });

        it('should restart mode listeners from the thread on softcommit', () => {
            sandbox.stub(controller, 'unbindListeners');
            sandbox.stub(controller, 'bindListeners');
            sandbox.stub(controller, 'registerThread');
            controller.handleThreadEvents(stubs.thread, {
                event: 'softcommit'
            });
            expect(controller.unbindListeners).to.be.called;
            expect(controller.bindListeners).to.be.called;
            expect(stubs.thread.saveAnnotation).to.be.called;
            expect(controller.registerThread).to.be.called;
            expect(stubs.thread.handleStart).to.not.be.called;
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
            sandbox.stub(controller, 'registerThread');
            sandbox.stub(controller, 'unbindListeners');
            sandbox.stub(controller, 'bindListeners').callsFake(() => {
                controller.currentThread = thread2;
            });

            controller.handleThreadEvents(thread1, data);
            expect(thread1.saveAnnotation).to.be.called;
            expect(controller.unbindListeners).to.be.called;
            expect(controller.bindListeners).to.be.called;
            expect(thread2.handleStart).to.be.calledWith(data.eventData.location);
        });

        it('should update undo and redo buttons on availableactions', () => {
            sandbox.stub(controller, 'updateUndoRedoButtonEls');

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

            sandbox.stub(controller, 'unbindListeners');
            sandbox.stub(controller, 'bindListeners');
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
            controller.annotator = {
                getLocationFromEvent: sandbox.stub().returns({ page: 1 })
            }
            stubs.getLoc = controller.annotator.getLocationFromEvent;
        });

        it('should do nothing with an empty event', () => {
            controller.handleSelection();
            expect(stubs.getLoc).to.not.be.called;
        })

        it('should do nothing if no location exists', () => {
            stubs.clean = sandbox.stub(controller, 'removeSelection');
            stubs.getLoc.returns(null);
            controller.handleSelection('event');
            expect(stubs.clean).to.not.be.called;
        });

        it('should call select on an thread found in the data store', () => {
            stubs.select = sandbox.stub(controller, 'select');
            stubs.clean = sandbox.stub(controller, 'removeSelection');
            stubs.getLoc.returns({
                x: 15,
                y: 15,
                page: 1
            });

            controller.handleSelection('event');
            expect(stubs.clean).to.be.called;
            expect(stubs.select).to.be.calledWith(stubs.thread);
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
            stubs.threadMock = sandbox.mock(thread);

            // Add pageEl
            controller.annotatedElement = document.createElement('div');
            stubs.pageEl = document.createElement('div');
            stubs.pageEl.setAttribute('data-page-number', 1);
            controller.annotatedElement.appendChild(stubs.pageEl);

            stubs.annotationLayerEl = document.createElement('canvas');
            stubs.annotationLayerEl.classList.add(CLASS_ANNOTATION_LAYER_DRAW);
            stubs.pageEl.appendChild(stubs.annotationLayerEl);

            sandbox.stub(stubs.annotationLayerEl, 'getContext').returns({
                clearRect: sandbox.stub()
            });
        });

        it('should do nothing if no threads exist or none are on the specified page', () => {
            stubs.threadMock.expects('show').never();
            controller.renderPage(1);

            controller.threads = {};
            controller.registerThread(thread);
            controller.renderPage(2);
        });

        it('should render the annotations on every page', () => {
            controller.threads = {};
            controller.registerThread(thread);
            stubs.threadMock.expects('show').once();
            controller.renderPage(1);

            const context = stubs.annotationLayerEl.getContext();
            expect(context.clearRect).to.be.called;
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
