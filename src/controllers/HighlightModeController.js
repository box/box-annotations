import AnnotationModeController from './AnnotationModeController';
import { clearCanvas } from '../util';
import {
    THREAD_EVENT,
    CONTROLLER_EVENT,
    TYPES,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT_COMMENT
} from '../constants';

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
        let firstAnnotation;
        switch (data.event) {
            case THREAD_EVENT.save:
                // Re-render plain highlight canvas when a plain highlight is converted to a highlight comment
                firstAnnotation = thread.annotations[0];
                if (
                    firstAnnotation &&
                    firstAnnotation.type === TYPES.highlight &&
                    Object.keys(thread.annotations).length === 2
                ) {
                    this.renderPage(thread.location.page);
                }
                break;
            case THREAD_EVENT.threadCleanup:
                this.emit(CONTROLLER_EVENT.renderPage, thread.location.page);
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
     * Renders annotations from memory.
     *
     * @inheritdoc
     * @private
     * @return {void}
     */
    render() {
        super.render();
        this.destroyPendingThreads();
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
        const layerClass =
            this.mode === TYPES.highlight ? CLASS_ANNOTATION_LAYER_HIGHLIGHT : CLASS_ANNOTATION_LAYER_HIGHLIGHT_COMMENT;
        clearCanvas(pageEl, layerClass);

        if (!this.threads) {
            return;
        }

        super.renderPage(pageNum);
    }
}

export default HighlightModeController;
