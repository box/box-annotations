/* eslint-disable no-unused-expressions */
import PointModeController from '../PointModeController';
import AnnotationModeController from '../AnnotationModeController';
import * as util from '../../util';
import {
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    SELECTOR_ANNOTATION_BUTTON_POINT_EXIT,
    SELECTOR_POINT_MODE_HEADER
} from '../../constants';

let controller;
let stubs = {};
const sandbox = sinon.sandbox.create();

describe('controllers/PointModeController', () => {
    beforeEach(() => {
        controller = new PointModeController();
        controller.container = document;
        stubs.thread = {
            show: () => {},
            getThreadEventData: () => {},
            destroy: () => {}
        };
        stubs.threadMock = sandbox.mock(stubs.thread);

        sandbox.stub(controller, 'emit');
        controller.annotatedElement = {};
        controller.annotator = {
            getLocationFromEvent: () => {},
            createAnnotationThread: () => {}
        };
        stubs.annotatorMock = sandbox.mock(controller.annotator);
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

        it('should set up the point annotations header if using the preview header', () => {
            controller.init({ options: { header: 'light' } });
            expect(controller.setupHeader).to.be.called;
        });
    });

    describe('setupHeader', () => {
        it('should setup header and get all the mode buttons', () => {
            const blankDiv = document.createElement('div');
            stubs.insertTemplate = sandbox.stub(util, 'insertTemplate');
            sandbox.stub(controller, 'getButton').returns(blankDiv);
            controller.localized = { closeButton: 'Close' };

            controller.setupHeader(blankDiv, blankDiv);
            expect(controller.getButton).to.be.calledWith(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
        });
    });

    describe('setupSharedDialog()', () => {
        it('should create a shared annotation dialog', () => {
            const options = {
                isMobile: true,
                hasTouch: false,
                localized: { cancelButton: 'cancel' }
            };

            controller.setupSharedDialog(document.createElement('div'), options);
            expect(controller.createDialog).to.not.be.undefined;
        });
    });

    describe('onDialogCancel()', () => {
        it('should unregister/destroy the pending thread and clear the create dialog', () => {
            sandbox.stub(controller, 'getThreadByID').returns(stubs.thread);
            sandbox.stub(controller, 'unregisterThread');
            sandbox.stub(controller, 'hideSharedDialog');

            stubs.threadMock.expects('destroy');
            controller.onDialogCancel();
            expect(controller.unregisterThread).to.be.calledWith(stubs.thread);
            expect(controller.hideSharedDialog).to.be.called;
        });
    });

    describe('onDialogPost()', () => {
        it('should notify listeners of post event and clear the create dialog', () => {
            sandbox.stub(controller, 'hideSharedDialog');
            controller.lastPointEvent = {};
            controller.pendingThreadID = '123abc';

            controller.onDialogPost('text');
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.createThread, {
                commentText: 'text',
                lastPointEvent: {},
                pendingThreadID: '123abc'
            });
            expect(controller.hideSharedDialog).to.be.called;
        });
    });

    describe('hideSharedDialog', () => {
        it('should not hide the shared annotation dialog if already hidden', () => {
            controller.createDialog = { hide: () => {} };
            const createMock = sandbox.mock(controller.createDialog);
            controller.createDialog.isVisible = false;

            createMock.expects('hide').never();
            controller.hideSharedDialog();
        });

        it('should hide the shared annotation dialog', () => {
            controller.createDialog = { hide: () => {} };
            const createMock = sandbox.mock(controller.createDialog);
            controller.createDialog.isVisible = true;

            createMock.expects('hide');
            controller.hideSharedDialog();
        });
    });

    describe('setupHandlers()', () => {
        it('should successfully contain mode handlers', () => {
            controller.exitButtonEl = 'also definitely not undefined';

            controller.setupHandlers();
            expect(controller.handlers.length).to.equal(2);
        });
    });

    describe('exit()', () => {
        beforeEach(() => {
            sandbox.stub(controller, 'destroyPendingThreads');
            sandbox.stub(controller, 'unbindListeners');

            // Set up annotation mode
            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);
        });

        it('should hide the createDialog if it exists', () => {
            controller.createDialog = {
                hide: () => {}
            };
            const createMock = sandbox.mock(controller.createDialog);
            createMock.expects('hide');
            controller.exit();
        });

        it('should exit annotation mode', () => {
            controller.exit();
            expect(controller.destroyPendingThreads).to.be.called;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.exit);
            expect(controller.unbindListeners).to.be.called;
            expect(controller.hadPendingThreads).to.be.false;
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
            sandbox.stub(util, 'replaceHeader');

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.buttonEl = document.createElement('button');
            controller.buttonEl.classList.add(CLASS_ACTIVE);
        });

        it('should enter annotation mode', () => {
            controller.enter();
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.enter);
            expect(controller.bindListeners).to.be.called;
            expect(util.replaceHeader).to.be.calledWith(controller.container, SELECTOR_POINT_MODE_HEADER);
        });

        it('should activate mode button if available', () => {
            controller.buttonEl = document.createElement('button');
            controller.enter();
            expect(controller.buttonEl).to.have.class(CLASS_ACTIVE);
            expect(util.replaceHeader).to.be.calledWith(controller.container, SELECTOR_POINT_MODE_HEADER);
        });
    });

    describe('pointClickHandler()', () => {
        const event = {
            stopPropagation: () => {},
            preventDefault: () => {}
        };

        beforeEach(() => {
            stubs.destroy = sandbox.stub(controller, 'destroyPendingThreads');
            sandbox.stub(controller, 'registerThread');
            controller.modeButton = {
                title: 'Point Annotation Mode',
                selector: '.bp-btn-annotate'
            };
            stubs.isInDialog = sandbox.stub(util, 'isInDialog').returns(false);

            const eventMock = sandbox.mock(event);
            eventMock.expects('stopPropagation');
            eventMock.expects('preventDefault');
        });

        afterEach(() => {
            controller.modeButton = {};
            controller.container = document;
        });

        it('should not destroy the pending thread if click was in the dialog', () => {
            stubs.isInDialog.returns(true);
            controller.pointClickHandler(event);
            expect(stubs.destroy).to.not.be.called;
        });

        it('should reset the mobile annotations dialog if the user is on a mobile device', () => {
            stubs.destroy.returns(false);
            stubs.annotatorMock.expects('getLocationFromEvent');
            stubs.threadMock.expects('show').never();
            controller.isMobile = true;

            controller.pointClickHandler(event);
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.resetMobileDialog);
        });

        it('should not do anything if thread is invalid', () => {
            stubs.destroy.returns(false);
            stubs.annotatorMock.expects('getLocationFromEvent');
            stubs.threadMock.expects('show').never();

            controller.pointClickHandler(event);
            expect(controller.registerThread).to.not.be.called;
        });

        it('should not create a thread if a location object cannot be inferred from the event', () => {
            stubs.destroy.returns(false);
            stubs.annotatorMock.expects('getLocationFromEvent').returns(null);
            stubs.annotatorMock.expects('createAnnotationThread').never();
            stubs.threadMock.expects('show').never();

            controller.pointClickHandler(event);
            expect(controller.registerThread).to.not.be.called;
        });

        it('should create, show, and bind listeners to a thread', () => {
            stubs.destroy.returns(false);
            stubs.annotatorMock.expects('getLocationFromEvent').returns({});
            stubs.annotatorMock.expects('createAnnotationThread').returns(stubs.thread);
            stubs.threadMock.expects('getThreadEventData').returns('data');
            stubs.threadMock.expects('show');

            controller.pointClickHandler(event);
            expect(controller.registerThread).to.be.called;
            expect(controller.emit).to.be.calledWith(THREAD_EVENT.pending, 'data');
            expect(controller.registerThread).to.be.calledWith(stubs.thread);
        });

        it('should show the create dialog', () => {
            stubs.destroy.returns(false);
            stubs.annotatorMock.expects('getLocationFromEvent').returns({});
            stubs.annotatorMock.expects('createAnnotationThread').returns(stubs.thread);
            stubs.threadMock.expects('getThreadEventData').returns('data');
            stubs.threadMock.expects('show');

            controller.isMobile = true;
            controller.container = document.createElement('div');
            controller.createDialog = {
                containerEl: document.createElement('div'),
                show: () => {},
                showCommentBox: () => {}
            };
            const createMock = sandbox.mock(controller.createDialog);
            createMock.expects('show').withArgs(controller.container);
            createMock.expects('showCommentBox');

            controller.pointClickHandler(event);
        });
    });
});
