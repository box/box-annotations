import AnnotationModeController from './AnnotationModeController';
import { CLASS_ANNOTATION_LAYER_HIGHLIGHT, THREAD_EVENT, CONTROLLER_EVENT, CREATE_EVENT, TYPES } from '../constants';
import CreateHighlightDialog from './CreateHighlightDialog';

class HighlightModeController extends AnnotationModeController {
    /**
     * @inheritdoc
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

    /**
     * @inheritdoc
     * @return {void}
     */
    destroy() {
        super.destroy();

        this.createDialog.removeListener(CREATE_EVENT.comment, this.onDialogPendingComment);
        this.createDialog.removeListener(CREATE_EVENT.post, this.onDialogPost);
        this.createDialog.removeListener(CREATE_EVENT.plain, this.onDialogPost);

        this.createDialog.destroy();
        this.createDialog = null;
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
     * @inheritdoc
     * @return {void}
     */
    handleThreadEvents(thread, data) {
        switch (data.event) {
            case THREAD_EVENT.threadCleanup:
                if (thread && !thread.location) {
                    this.renderPage(thread.location.page);
                }
                break;
            default:
        }

        super.handleThreadEvents(thread, data);
    }

    /**
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
     * @inheritdoc
     * @return {void}
     */
    enter() {
        this.emit(CONTROLLER_EVENT.unbindDOMListeners); // Disable other annotations
        this.bindListeners(); // Enable mode
    }

    /**
     * @inheritdoc
     * @return {void}
     */
    renderPage(pageNum) {
        // Clear context if needed
        const pageEl = this.annotatedElement.querySelector(`[data-page-number="${pageNum}"]`);
        const annotationLayerEl = pageEl.querySelector(`.${CLASS_ANNOTATION_LAYER_HIGHLIGHT}`);
        if (annotationLayerEl) {
            const context = annotationLayerEl.getContext('2d');
            context.clearRect(0, 0, annotationLayerEl.width, annotationLayerEl.height);
        }

        super.renderPage(pageNum);
    }
}

export default HighlightModeController;
