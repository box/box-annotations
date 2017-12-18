import EventEmitter from 'events';
import HighlightModeController from '../HighlightModeController';
import CreateHighlightDialog from '../CreateHighlightDialog';
import * as util from '../../util';
import {
    CLASS_HIDDEN,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT,
    THREAD_EVENT,
    STATES,
    CONTROLLER_EVENT
} from '../../constants';

let controller;
let stubs = {};
const sandbox = sinon.sandbox.create();

describe('controllers/HighlightModeController', () => {
    beforeEach(() => {
        controller = new HighlightModeController();
        sandbox.stub(controller, 'emit');
        stubs.thread = { location: { page: 1 } };
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        stubs = {};
        controller = null;
    });

    describe('setupSharedDialog()', () => {
        it('should setup the create highlight dialog', () => {
            controller.setupSharedDialog();
            expect(controller.createDialog).to.not.be.undefined;
        });
    });

    describe('onDialogPendingComment', () => {
        it('should emit createPendingThread event', () => {
            controller.onDialogPendingComment();
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.createPendingThread);
        });
    });

    describe('handleThreadEvents()', () => {
        it('should re-render page and unregister thread on threadCleanup', () => {
            stubs.thread.location = { page: 1 };
            sandbox.stub(controller, 'renderPage');
            sandbox.stub(controller, 'unregisterThread');

            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.threadCleanup, data: {} });
            expect(controller.unregisterThread).to.be.called; expect(controller.renderPage).to.be.calledWith(stubs.thread.location.page);
        });
    });

    describe('exit()', () => {
        it('should exit annotation mode', () => {
            sandbox.stub(controller, 'destroyPendingThreads');
            sandbox.stub(controller, 'unbindListeners');

            const selection = window.getSelection();
            sandbox.stub(selection, 'removeAllRanges');

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.exit();
            expect(controller.destroyPendingThreads).to.be.called;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.bindDOMListeners);
            expect(controller.unbindListeners).to.be.called;
            expect(selection.removeAllRanges);
        });
    });

    describe('enter()', () => {
        it('should enter annotation mode', () => {
            sandbox.stub(controller, 'bindListeners');

            controller.annotatedElement = document.createElement('div');
            controller.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);

            controller.enter();
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.unbindDOMListeners);
            expect(controller.bindListeners).to.be.called;
        });
    });

    describe('renderPage()', () => {
        it('should clear the annotation layer context and re-render annotations on they specified page', () => {
            const page = 1;

            // Add pageEl
            controller.annotatedElement = document.createElement('div');
            stubs.pageEl = document.createElement('div');
            stubs.pageEl.setAttribute('data-page-number', page);
            controller.annotatedElement.appendChild(stubs.pageEl);

            const annotationLayerEl = document.createElement('canvas');
            annotationLayerEl.classList.add(CLASS_ANNOTATION_LAYER_HIGHLIGHT);
            stubs.pageEl.appendChild(annotationLayerEl);

            sandbox.stub(annotationLayerEl, 'getContext').returns({
                clearRect: sandbox.stub()
            });

            controller.renderPage(page);

            const context = annotationLayerEl.getContext();
            expect(context.clearRect).to.be.called;
        });
    });
});
