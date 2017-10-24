import AnnotationModeController from './AnnotationModeController';
import { ANNOTATOR_EVENT, THREAD_EVENT } from '../annotationConstants';

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
                // Thread should be cleaned up, unbind listeners - we
                // don't do this in annotationdelete listener since thread
                // may still need to respond to error messages
                this.unregisterThread(thread);
                this.emit('showhighlights', thread.location.page);
                break;
            case THREAD_EVENT.threadDelete:
                // Thread was deleted, remove from thread map
                this.unregisterThread(thread);
                this.emit(data.event, data.data);
                break;
            case THREAD_EVENT.deleteError:
                this.emit(ANNOTATOR_EVENT.error, this.localized.deleteError);
                this.emit(data.event, data.data);
                break;
            case THREAD_EVENT.createError:
                this.emit(ANNOTATOR_EVENT.error, this.localized.createError);
                this.emit(data.event, data.data);
                break;
            default:
                this.emit(data.event, data.data);
        }
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
        this.emit('unbinddomlisteners'); // Disable other annotations
        this.bindListeners(); // Enable mode
    }
}

export default HighlightModeController;
