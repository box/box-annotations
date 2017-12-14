import AnnotationModeController from './AnnotationModeController';
import { THREAD_EVENT, CONTROLLER_EVENT, CREATE_EVENT, TYPES } from '../constants';
import CreateHighlightDialog from './CreateHighlightDialog';

class HighlightModeController extends AnnotationModeController {
    /**
     * Set up the shared mobile dialog and associated listeners
     *
     * @protected
     * @return {void}
     */
    setupSharedDialog() {
        this.allowComment = !!(this.mode === TYPES.highlight_comment);
        this.allowHighlight = !!(this.mode === TYPES.highlight);

        this.createDialog = new CreateHighlightDialog(this.container, {
            isMobile: this.isMobile,
            hasTouch: this.hasTouch,
            allowComment: this.allowComment,
            allowHighlight: this.allowHighlight,
            localized: this.localized
        });
        this.createDialog.createElement();

        this.onDialogPendingComment = this.onDialogPendingComment.bind(this);
        this.onDialogPost = this.onDialogPost.bind(this);
        this.destroyPendingThreads = this.destroyPendingThreads.bind(this);

        this.createDialog.addListener(CREATE_EVENT.init, () => this.emit(THREAD_EVENT.pending, this.mode));

        if (this.allowComment) {
            this.createDialog.addListener(CREATE_EVENT.comment, this.onDialogPendingComment);
            this.createDialog.addListener(CREATE_EVENT.post, this.onDialogPost);
        }

        if (this.allowHighlight) {
            this.createDialog.addListener(CREATE_EVENT.plain, this.onDialogPost);
        }
    }

    destroy() {
        super.destroy();

        this.createHighlightDialog.removeListener(CREATE_EVENT.comment, this.onDialogPendingComment);
        this.createHighlightDialog.removeListener(CREATE_EVENT.post, this.onDialogPost);
        this.createHighlightDialog.removeListener(CREATE_EVENT.plain, this.onDialogPost);

        this.createHighlightDialog.destroy();
        this.createHighlightDialog = null;
    }

    /**
     * Notify listeners of post event and then clear the create dialog
     *
     * @private
     * @param {string} commentText Annotation comment text
     * @return {void}
     */
    onDialogPendingComment() {
        this.emit(CONTROLLER_EVENT.createPendingThread);
    }

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
