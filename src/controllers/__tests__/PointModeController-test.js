import EventEmitter from 'events';
import PointModeController from '../PointModeController';
import CreateAnnotationDialog from '../../CreateAnnotationDialog';
import * as util from '../../annotatorUtil';
import {
    CLASS_HIDDEN,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    ANNOTATOR_EVENT,
    THREAD_EVENT,
    STATES,
    CONTROLLER_EVENT,
    CREATE_EVENT
} from '../../annotationConstants';

let controller;
let stubs = {};
const sandbox = sinon.sandbox.create();

describe('controllers/PointModeController', () => {
    beforeEach(() => {
        controller = new PointModeController();
        stubs.thread = {
            show: () => {},
            getThreadEventData: () => {}
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

    describe('setupSharedDialog', () => {
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
            controller.postButtonEl = 'not undefined';
            controller.cancelButtonEl = 'definitely not undefined';

            controller.setupHandlers();
            expect(controller.handlers.length).to.equal(3);
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
        });

        afterEach(() => {
            controller.modeButton = {};
            controller.container = document;
        });

        it('should not do anything if there are pending threads', () => {
            stubs.destroy.returns(true);
            stubs.annotatorMock.expects('createAnnotationThread').never();
            stubs.annotatorMock.expects('getLocationFromEvent').never();
            stubs.threadMock.expects('show').never();

            controller.pointClickHandler(event);
            expect(controller.registerThread).to.not.be.called;
            expect(controller.emit).to.not.be.calledWith(CONTROLLER_EVENT.toggleMode);
        });

        it('should not do anything if thread is invalid', () => {
            stubs.destroy.returns(false);
            stubs.annotatorMock.expects('getLocationFromEvent');
            stubs.threadMock.expects('show').never();

            controller.pointClickHandler(event);
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.toggleMode);
            expect(controller.registerThread).to.not.be.called;
        });

        it('should not create a thread if a location object cannot be inferred from the event', () => {
            stubs.destroy.returns(false);
            stubs.annotatorMock.expects('getLocationFromEvent').returns(null);
            stubs.annotatorMock.expects('createAnnotationThread').never();
            stubs.threadMock.expects('show').never();

            controller.pointClickHandler(event);
            expect(controller.registerThread).to.not.be.called;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.toggleMode);
        });

        it('should create, show, and bind listeners to a thread', () => {
            stubs.destroy.returns(false);
            stubs.annotatorMock.expects('getLocationFromEvent').returns({});
            stubs.annotatorMock.expects('createAnnotationThread').returns(stubs.thread);
            stubs.threadMock.expects('getThreadEventData').returns('data');
            stubs.threadMock.expects('show');

            controller.pointClickHandler(event);
            expect(controller.registerThread).to.be.called;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.toggleMode);
            expect(controller.emit).to.be.calledWith(THREAD_EVENT.pending, 'data');
            expect(controller.hadPendingThreads).to.be.truthy;
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
