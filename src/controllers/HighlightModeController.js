import AnnotationModeController from './AnnotationModeController';
import { clearCanvas } from '../util';
import { THREAD_EVENT, CONTROLLER_EVENT, CLASS_ANNOTATION_LAYER_HIGHLIGHT } from '../constants';

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
                this.renderPage(thread.location.page);
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

    /**
     * Renders annotations from memory for a specified page.
     *
     * @inheritdoc
     * @private
     * @param {number} pageNum - Page number
     * @return {void}
     */
    renderPage(pageNum) {
        // Clear context if needed
        const pageEl = this.annotatedElement.querySelector(`[data-page-number="${pageNum}"]`);
        clearCanvas(pageEl, CLASS_ANNOTATION_LAYER_HIGHLIGHT);

        if (!this.threads) {
            return;
        }

        super.renderPage(pageNum);
    }
}

export default HighlightModeController;
