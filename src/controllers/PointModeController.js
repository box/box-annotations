import AnnotationModeController from './AnnotationModeController';
import shell from './pointShell.html';
import {
    TYPES,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    CREATE_EVENT,
    CLASS_ACTIVE,
    SELECTOR_ANNOTATION_BUTTON_POINT_EXIT
} from '../constants';
import CreateAnnotationDialog from '../CreateAnnotationDialog';
import { isInDialog } from '../util';

class PointModeController extends AnnotationModeController {
    /** @property {HTMLElement} - The button to exit point annotation mode */
    exitButtonEl;

    /** @property {HTMLElement} - The button to cancel the pending thread */
    cancelButtonEl;

    /** @property {HTMLElement} - The button to commit the pending thread */
    postButtonEl;

    /**
     * Initializes mode controller.
     *
     * @inheritdoc
     * @param {Object} data - Options for constructing a controller
     * @return {void}
     */
    init(data) {
        super.init(data);

        // If the header coming from the preview options is not none (e.g.
        // light, dark, or no value given), then we want to use our draw
        // header. Otherwise we expect header UI to be handled by Preview’s
        // consumer
        if (data.options.header !== 'none') {
            this.setupHeader(this.container, shell);
        }

        this.exitButtonEl = this.getButton(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
    }

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

        this.pushElementHandler(this.exitButtonEl, 'click', () => {
            if (this.currentThread) {
                this.currentThread.cancelUnsavedAnnotation();
            }

            this.toggleMode();
        });

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
     * Disables the specified annotation mode
     *
     * @inheritdoc
     * @return {void}
     */
    exit() {
        if (this.createDialog) {
            this.createDialog.hide();
        }

        if (this.buttonEl) {
            this.buttonEl.classList.remove(CLASS_ACTIVE);
        }

        super.exit();
    }

    /**
     * Enables the specified annotation mode
     *
     * @inheritdoc
     * @return {void}
     */
    enter() {
        super.enter();
        if (this.buttonEl) {
            this.buttonEl.classList.add(CLASS_ACTIVE);
        }
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
        // Determine if a point annotation dialog is already open and close the
        // current open dialog
        if (isInDialog(event)) {
            return;
        }

        this.hadPendingThreads = this.destroyPendingThreads();

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
