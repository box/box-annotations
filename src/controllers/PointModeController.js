import AnnotationModeController from './AnnotationModeController';
import { TYPES, THREAD_EVENT, CONTROLLER_EVENT, CREATE_EVENT } from '../constants';
import CreateAnnotationDialog from '../CreateAnnotationDialog';

class PointModeController extends AnnotationModeController {
    /** @property {HTMLElement} - The button to cancel the pending thread */
    cancelButtonEl;

    /** @property {HTMLElement} - The button to commit the pending thread */
    postButtonEl;

    /**
     * Set up the shared mobile dialog and associated listeners
     *
     * @protected
     * @param {HTMLElement} container - The container element for the file
     * @param {Object} options - Controller options to pass into the create dialog
     * @return {void}
     */
    setupSharedDialog(container, options) {
        this.createDialog = new CreateAnnotationDialog(container, {
            isMobile: options.isMobile,
            hasTouch: options.hasTouch,
            localized: options.localized
        });
        this.createDialog.createElement();

        this.onDialogCancel = this.onDialogCancel.bind(this);
        this.onDialogPost = this.onDialogPost.bind(this);
        this.destroyPendingThreads = this.destroyPendingThreads.bind(this);

        this.createDialog.addListener(CREATE_EVENT.init, () => this.emit(THREAD_EVENT.pending, TYPES.point));
        this.createDialog.addListener(CREATE_EVENT.cancel, this.onDialogCancel);
        this.createDialog.addListener(CREATE_EVENT.post, this.onDialogPost);
    }

    /**
     * Unregister/destroy the pending thread and then clear the create dialog
     *
     * @private
     * @return {void}
     */
    onDialogCancel() {
        const thread = this.getThreadByID(this.pendingThreadID);
        this.unregisterThread(thread);
        thread.destroy();

        this.hideSharedDialog();
    }

    /**
     * Notify listeners of post event and then clear the create dialog
     *
     * @private
     * @param {string} commentText Annotation comment text
     * @return {void}
     */
    onDialogPost(commentText) {
        this.emit(CONTROLLER_EVENT.createThread, {
            commentText,
            lastPointEvent: this.lastPointEvent,
            pendingThreadID: this.pendingThreadID
        });

        this.hideSharedDialog();
    }

    /**
     * Hides the shared mobile dialog and clears associated data
     *
     * @protected
     * @return {void}
     */
    hideSharedDialog() {
        this.lastPointEvent = null;
        this.pendingThreadID = null;

        if (this.createDialog && this.createDialog.isVisible) {
            this.createDialog.hide();
        }
    }

    /**
     * Set up and return the necessary handlers for the annotation mode
     *
     * @inheritdoc
     * @protected
     * @return {Array} An array where each element is an object containing
     * the object that will emit the event, the type of events to listen
     * for, and the callback
     */
    setupHandlers() {
        this.pointClickHandler = this.pointClickHandler.bind(this);
        // Get handlers
        this.pushElementHandler(this.annotatedElement, ['mousedown', 'touchstart'], this.pointClickHandler);

        this.pushElementHandler(this.cancelButtonEl, 'click', () => {
            this.currentThread.cancelUnsavedAnnotation();
            this.emit(CONTROLLER_EVENT.toggleMode);
        });

        this.pushElementHandler(this.postButtonEl, 'click', () => {
            this.currentThread.saveAnnotation(TYPES.point);
            this.emit(CONTROLLER_EVENT.toggleMode);
        });
    }

    /**
     * Event handler for adding a point annotation. Creates a point annotation
     * thread at the clicked location.
     *
     * @protected
     * @param {Event} event - DOM event
     * @return {void}
     */
    pointClickHandler(event) {
        event.stopPropagation();
        event.preventDefault();

        // Determine if a point annotation dialog is already open and close the
        // current open dialog
        this.hadPendingThreads = this.destroyPendingThreads();
        if (this.hadPendingThreads) {
            return;
        }

        // Exits point annotation mode on first click
        this.emit(CONTROLLER_EVENT.toggleMode);
        this.hadPendingThreads = true;

        // Get annotation location from click event, ignore click if location is invalid
        const location = this.annotator.getLocationFromEvent(event, TYPES.point);
        if (!location) {
            return;
        }

        // Create new thread with no annotations, show indicator, and show dialog
        const thread = this.annotator.createAnnotationThread([], location, TYPES.point);
        if (!thread) {
            return;
        }

        if (this.isMobile) {
            this.lastPointEvent = event;
            this.pendingThreadID = thread.threadID;

            this.container.appendChild(this.createDialog.containerEl);
            this.createDialog.show(this.container);
            this.createDialog.showCommentBox();
        }

        thread.show();
        this.registerThread(thread);
        this.emit(THREAD_EVENT.pending, thread.getThreadEventData());
    }
}

export default PointModeController;
