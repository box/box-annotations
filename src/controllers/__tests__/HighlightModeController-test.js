import EventEmitter from 'events';
import HighlightModeController from '../HighlightModeController';
import * as util from '../../util';
import {
    CLASS_HIDDEN,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
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

    describe('handleThreadEvents()', () => {
        it('should unregister thread on threadCleanup', () => {
            sandbox.stub(controller, 'unregisterThread');
            controller.handleThreadEvents(stubs.thread, { event: THREAD_EVENT.threadCleanup, data: {} });
            expect(controller.unregisterThread).to.be.called;
            expect(controller.emit).to.be.calledWith(CONTROLLER_EVENT.showHighlights, 1);
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
});
