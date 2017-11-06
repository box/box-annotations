import AnnotationModeController from './AnnotationModeController';
import { THREAD_EVENT, CONTROLLER_EVENT } from '../annotationConstants';

class HighlightModeController extends AnnotationModeController {
    /**
     * Handles annotation thread events and emits them to the viewer
     *
     * @inheritdoc
     * @private
     * @param {AnnotationThread} thread - The thread that emitted the event
     * @param {Object} [data] - Annotation thread event data
     * @param {string} [data.event] - Annotation thread event
     * @param {string} [data.data] - Annotation thread event data
     * @return {void}
     */
    handleThreadEvents(thread, data) {
        switch (data.event) {
            case THREAD_EVENT.threadCleanup:
                this.emit(CONTROLLER_EVENT.showHighlights, thread.location.page);
                break;
            default:
        }

        super.handleThreadEvents(thread, data);
    }

    /**
     * Disables the specified annotation mode
     *
     * @inheritdoc
     * @return {void}
     */
    exit() {
        this.destroyPendingThreads();
        window.getSelection().removeAllRanges();
        this.unbindListeners(); // Disable mode
        this.emit(CONTROLLER_EVENT.bindDOMListeners);
    }

    /**
     * Enables the specified annotation mode
     *
     * @inheritdoc
     * @return {void}
     */
    enter() {
        this.emit(CONTROLLER_EVENT.unbindDOMListeners); // Disable other annotations
        this.bindListeners(); // Enable mode
    }
}

export default HighlightModeController;
