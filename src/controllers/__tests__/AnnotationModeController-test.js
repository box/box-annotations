import EventEmitter from 'events';
import AnnotationModeController from '../AnnotationModeController';
import DocDrawingThread from '../../doc/DocDrawingThread';
import * as util from '../../annotatorUtil';
import {
    CLASS_HIDDEN,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    ANNOTATOR_EVENT,
    THREAD_EVENT,
    STATES,
    CONTROLLER_EVENT
} from '../../annotationConstants';

let controller;
let stubs = {};
const sandbox = sinon.sandbox.create();

describe('controllers/AnnotationModeController', () => {
    beforeEach(() => {
        controller = new AnnotationModeController();
        stubs.thread = {
            threadID: '123abc',
            location: { page: 1 },
            type: 'type',
            state: STATES.pending,
            addListener: () => {},
            removeListener: () => {},
            saveAnnotation: () => {},
            handleStart: () => {},
            destroy: () => {},
            deleteThread: () => {},
            show: () => {}
        };
        stubs.threadMock = sandbox.mock(stubs.thread);
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        stubs = {};
        controller = null;
    });

    describe('init()', () => {
        it('should init controller', () => {
            sandbox.stub(controller, 'showButton');
            controller.init({
                modeButton: {},
                permissions: { canAnnotate: true }
            });
            expect(controller.showButton).to.be.called;
        });

        it('should not show modeButton if none provided', () => {
            sandbox.stub(controller, 'showButton');
            controller.init({});
            expect(controller.showButton).to.not.be.called;
        });

        it('should not show modeButton if none provided', () => {
            sandbox.stub(controller, 'showButton');
            controller.init({
                modeButton: {},
                permissions: { canAnnotate: false }
            });
            expect(controller.showButton).to.not.be.called;
        });
    });

    describe('destroy()', () => {
        it('should destroy all the threads in controller', () => {
            controller.threads = { 1: {
                '123abc': stubs.thread
            }};

            controller.destroy();
            expect(controller.buttonEl).to.be.undefined;
        });

        it('should remove listener from button', () => {
            controller.buttonEl = {
                removeEventListener: sandbox.stub()
            };
            controller.destroy();
            expect(controller.buttonEl.removeEventListener).to.be.called;
        });
    });

    describe('getButton', () => {
        it('should return the annotation mode button', () => {
            const buttonEl = document.createElement('button');
            buttonEl.classList.add('class');
            controller.container = document.createElement('div');
            controller.container.appendChild(buttonEl);

            expect(controller.getButton('.class')).to.not.be.null;
        });
    })

    describe('showButton()', () => {
        beforeEach(() => {
            controller.modeButton = {
                type: {
                    title: 'Annotation Mode',
                    selector: '.selector'
                }
            };
            const buttonEl = document.createElement('button');
            buttonEl.title = controller.modeButton.title;
            buttonEl.classList.add(CLASS_HIDDEN);
            buttonEl.classList.add('selector');

            controller.permissions = { canAnnotate: true };
            stubs.getButton = sandbox.stub(controller, 'getButton').returns(buttonEl);
        });

        it('should do nothing if user cannot annotate', () => {
            const buttonEl = controller.getButton(controller.modeButton.selector);
            controller.permissions.canAnnotate = false;
            controller.showButton();
            expect(buttonEl).to.have.class(CLASS_HIDDEN);
        });

        it('should do nothing if the button is not in the container', () => {
            const buttonEl = controller.getButton(controller.modeButton.selector);
            stubs.getButton.returns(null);
            controller.showButton();
            expect(buttonEl).to.have.class(CLASS_HIDDEN);
        });

        it('should set up and show an annotate button', () => {
            const buttonEl = controller.getButton(controller.modeButton.selector);
            sandbox.stub(buttonEl, 'addEventListener');

            controller.showButton();
            expect(buttonEl).to.not.have.class(CLASS_HIDDEN);
            expect(buttonEl.addEventListener).to.be.calledWith('click', controller.toggleMode);
        });
    });

    describe('toggleMode()', () => {
        beforeEach(() => {
            sandbox.stub(controller, 'destroyPendingThreads');
            sandbox.stub(controller, 'emit');
        });

        it('should destroy all threads', () => {
            controller.modeButton = undefined;
            controller.toggleMode();
            expect(controller.emit).to.not.be.calledWith(CONTROLLER_EVENT.toggleMode);
        });

        it('should only toggle the current annotation mode if it has a button', () => {
            controller.modeButton = {};
            controller.toggleMode();
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.toggleMode);
        });
    });

    describe('exit()', () => {
        beforeEach(() => {
            sandbox.stub(controller, 'destroyPendingThreads');
            sandbox.stub(controller, 'unbindListeners');
            sandbox.stub(controller, 'emit');

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
        });

        it('should exit annotation mode', () => {
            controller.exit();
            expect(controller.destroyPendingThreads).to.be.called;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.exit);
            expect(controller.unbindListeners).to.be.called;
            expect(controller.hadPendingThreads).to.be.falsy;
        });

        it('should deactive mode button if available', () => {
            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);
            controller.exit();
            expect(controller.buttonEl).to.not.have.class(CLASS_ACTIVE);
        });
    });

    describe('enter()', () => {
        beforeEach(() => {
            sandbox.stub(controller, 'bindListeners');
            sandbox.stub(controller, 'emit');

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
        });

        it('should enter annotation mode', () => {
            controller.enter();
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.enter);
            expect(controller.bindListeners).to.be.called;
        });

        it('should activate mode button if available', () => {
            controller.buttonEl = document.createElement('button');
            controller.enter();
            expect(controller.buttonEl).to.have.class(CLASS_ACTIVE);
        });
    });

    describe('isEnabled()', () => {
        it('should return whether or not the current annotation mode is enabled', () => {
            controller.buttonEl = document.createElement('button');
            expect(controller.isEnabled()).to.be.falsy;

            controller.buttonEl.classList.add(CLASS_ACTIVE);
            expect(controller.isEnabled()).to.be.truthy;
        });
    })

    describe('bindListeners()', () => {
        it('should bind mode listeners', () => {
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
            expect(handlerObj.eventObj.addEventListener).to.be.calledWith(handlerObj.type, handlerObj.func);
            expect(controller.handlers.length).to.equal(1);
        });
    });

    describe('unbindListeners()', () => {
        it('should unbind mode listeners', () => {
            const handlerObj = {
                type: 'event',
                func: () => {},
                eventObj: {
                    removeEventListener: sandbox.stub()
                }
            };

            controller.handlers = [handlerObj];
            expect(controller.handlers.length).to.equal(1);

            controller.unbindListeners();
            expect(handlerObj.eventObj.removeEventListener).to.be.calledWith(handlerObj.type, handlerObj.func);
            expect(controller.handlers.length).to.equal(0);
        });
    });

    describe('registerThread()', () => {
        it('should internally keep track of the registered thread', () => {
            sandbox.stub(controller, 'emit');
            controller.threads = { 1: {} };
            const pageThreads = controller.threads[1];
            const thread = {
                threadID: '123abc',
                location: { page: 1 },
                addListener: sandbox.stub()
            };
            expect(thread.threadID in pageThreads).to.be.falsy;

            controller.registerThread(thread);
            expect(pageThreads[thread.threadID]).equals(thread);
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.register, thread);
            expect(thread.addListener).to.be.calledWith('threadevent', sinon.match.func);
        });
    });

    describe('unregisterThread()', () => {
        it('should internally keep track of the registered thread', () => {
            sandbox.stub(controller, 'emit');
            controller.threads = { 1: {} };
            const pageThreads = controller.threads[1];
            const thread = {
                threadID: '123abc',
                location: { page: 1 },
                addListener: sandbox.stub(),
                removeListener: sandbox.stub()
            };
            controller.registerThread(thread);
            expect(thread.threadID in pageThreads).to.be.truthy;

            controller.unregisterThread(thread);
            expect(thread.threadID in pageThreads).to.be.falsy;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.unregister, thread);
            expect(thread.removeListener).to.be.calledWith('threadevent', sinon.match.func);
        });
    });

    describe('getThreadByID()', () => {
        it('should find and return annotation thread specified by threadID', () => {
            controller.threads = { 1: { '123abc': stubs.thread } };
            const thread = controller.getThreadByID(stubs.thread.threadID);
            expect(thread).to.deep.equals(stubs.thread);
        });

        it('should return null if specified annotation thread is invalid', () => {
            controller.threads = { 1: { '123abc': stubs.thread } };
            const thread = controller.getThreadByID('random');
            expect(thread).to.deep.equals(null);
        });
    });

    describe('handleThreadEvents()', () => {
        beforeEach(() => {
            sandbox.stub(controller, 'unregisterThread');
            sandbox.stub(controller, 'emit');
            controller.localized = {
                deleteError: 'delete error',
                createError: 'create error'
            }
        });

        it('should mark hadPendingThreads as false and emit event on thread save or cancel', () => {
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.save, data: {} });
            expect(controller.emit).to.be.calledWith(THREAD_EVENT.save, sinon.match.object);
            expect(controller.hadPendingThreads).to.be.falsy;

            controller.hadPendingThreads = true;
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.cancel, data: {} });
            expect(controller.emit).to.be.calledWith(THREAD_EVENT.cancel, sinon.match.object);
            expect(controller.hadPendingThreads).to.be.falsy;
        });

        it('should unregister thread on threadCleanup', () => {
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.threadCleanup, data: {} });
            expect(controller.unregisterThread).to.be.called;
        });

        it('should unregister thread on threadDelete', () => {
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.threadDelete, data: {} });
            expect(controller.unregisterThread).to.be.called;
            expect(controller.emit).to.be.calledWith(THREAD_EVENT.threadDelete, sinon.match.object);
        });

        it('should unregister thread on deleteError', () => {
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.deleteError, data: {} });
            expect(controller.emit).to.be.calledWith(ANNOTATOR_EVENT.error, controller.localized.deleteError);
            expect(controller.emit).to.be.calledWith(THREAD_EVENT.deleteError, sinon.match.object);
        });

        it('should unregister thread on createError', () => {
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.createError, data: {} });
            expect(controller.emit).to.be.calledWith(ANNOTATOR_EVENT.error, controller.localized.createError);
            expect(controller.emit).to.be.calledWith(THREAD_EVENT.createError, sinon.match.object);
        });

        it('should emit the event on default', () => {
            controller.handleThreadEvents(stubs.thread, { event: 'random', data: {} });
            expect(controller.emit).to.be.calledWith('random', sinon.match.object);
        });
    });

    describe('pushElementHandler()', () => {
        it('should do nothing when the element is invalid', () => {
            const lengthBefore = controller.handlers.length;

            controller.pushElementHandler(undefined, 'type', () => {});
            const lengthAfter = controller.handlers.length;
            expect(lengthAfter).to.equal(lengthBefore);
        });

        it('should add a handler descriptor to the handlers array', () => {
            const lengthBefore = controller.handlers.length;
            const element = 'element';
            const type = ['type1', 'type2'];
            const fn = 'fn';

            controller.pushElementHandler(element, type, fn);
            const handlers = controller.handlers;
            const lengthAfter = handlers.length;
            expect(lengthAfter).to.equal(lengthBefore+1);
            expect(handlers[handlers.length - 1]).to.deep.equal({
                eventObj: element,
                func: fn,
                type
            });
        });
    });

    describe('setupHeader()', () => {
        it('should insert the new header into the container before the baseheader', () => {
            stubs.insertTemplate = sandbox.stub(util, 'insertTemplate');
            const container = {
                firstElementChild: 'child'
            };
            const header = document.createElement('div');

            controller.setupHeader(container, header);

            expect(stubs.insertTemplate).to.be.calledWith(container, header);
        });
    });

    describe('destroyPendingThreads()', () => {
        beforeEach(() => {
            stubs.isPending = sandbox.stub(util, 'isPending').returns(false);
            stubs.isPending.withArgs(STATES.pending).returns(true);

            controller.registerThread(stubs.thread);
        });

        it('should destroy and return true if there are any pending threads', () => {
            stubs.threadMock.expects('destroy');
            const destroyed = controller.destroyPendingThreads();
            expect(destroyed).to.equal(true);
        });

        it('should not destroy and return false if there are no threads', () => {
            controller.threads = {};
            stubs.threadMock.expects('destroy').never();
            stubs.isPending.returns(false);
            const destroyed = controller.destroyPendingThreads();
            expect(destroyed).to.equal(false);
        });

        it('should not destroy and return false if the threads are not pending', () => {
            stubs.thread.state = 'NOT_PENDING';
            stubs.threadMock.expects('destroy').never();
            const destroyed = controller.destroyPendingThreads();
            expect(destroyed).to.equal(false);
        });

        it('should destroy only pending threads, and return true', () => {
            stubs.thread.state = 'NOT_PENDING';
            const pendingThread = {
                threadID: '456def',
                location: { page: 1 },
                type: 'type',
                state: STATES.pending,
                destroy: () => {},
                unbindCustomListenersOnThread: () => {},
                addListener: () => {},
                removeAllListeners: () => {}
            };
            stubs.pendingMock = sandbox.mock(pendingThread);
            controller.registerThread(pendingThread);

            stubs.threadMock.expects('destroy').never();
            stubs.pendingMock.expects('destroy');
            const destroyed = controller.destroyPendingThreads();

            expect(destroyed).to.equal(true);
        });
    });

    describe('emit()', () => {
        const emitFunc = EventEmitter.prototype.emit;

        afterEach(() => {
            Object.defineProperty(EventEmitter.prototype, 'emit', { value: emitFunc });
        });

        it('should pass through the event as well as broadcast it as a controller event', () => {
            const mode = 'this mode';
            const event = 'event';
            const data = {};
            controller.mode = mode;

            const emitStub = sandbox.stub();
            Object.defineProperty(EventEmitter.prototype, 'emit', { value: emitStub });

            controller.emit(event, data);

            expect(emitStub).to.be.calledWith(event, data);
            expect(emitStub).to.be.calledWithMatch('annotationcontrollerevent', { event, data, mode });
        });
    });
});
