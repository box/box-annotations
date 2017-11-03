import AnnotationModeController from './AnnotationModeController';
import { THREAD_EVENT } from '../annotationConstants';

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
                this.emit('showhighlights', thread.location.page);
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
        this.emit('binddomlisteners');
    }

    /**
     * Enables the specified annotation mode
     *
     * @inheritdoc
     * @return {void}
     */
    enter() {
        this.emit(''); // Disable other annotations
        this.bindListeners(); // Enable mode
    }
}

export default HighlightModeController;
