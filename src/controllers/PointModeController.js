// @flow
import AnnotationModeController from './AnnotationModeController';
import DocPointThread from '../doc/DocPointThread';
import ImagePointThread from '../image/ImagePointThread';
import shell from './pointShell.html';
import {
    TYPES,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    CREATE_EVENT,
    CLASS_ACTIVE,
    SELECTOR_POINT_MODE_HEADER,
    SELECTOR_ANNOTATION_BUTTON_POINT_EXIT,
    CLASS_ANNOTATION_POINT_MODE,
    ANNOTATOR_TYPE
} from '../constants';
import CreateAnnotationDialog from '../CreateAnnotationDialog';
import { isInDialog, replaceHeader, isInAnnotationOrMarker } from '../util';

class PointModeController extends AnnotationModeController {
    /** @property {HTMLElement} - The button to exit point annotation mode */
    exitButtonEl: HTMLElement;

    /** @inheritdoc */
    init(data: Object): void {
        super.init(data);

        // If the header coming from the preview options is not none (e.g.
        // light, dark, or no value given), then we want to use our draw
        // header. Otherwise we expect header UI to be handled by Preview’s
        // consumer
        if (data.options.header !== 'none') {
            this.setupHeader(this.container, shell);
        }
    }

    /** @inheritdoc */
    setupHeader(container: HTMLElement, header: HTMLElement): void {
        super.setupHeader(container, header);

        this.exitButtonEl = this.getButton(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);

        // TODO(@spramod): Remove '||' string, once closeButton is properly localized
        this.exitButtonEl.textContent = this.localized.closeButton || 'Close';
    }

    /**
     * Set up the shared mobile dialog and associated listeners
     *
     * @protected
     * @param {HTMLElement} container - The container element for the file
     * @param {Object} options - Controller options to pass into the create dialog
     * @return {void}
     */
    setupSharedDialog(container: HTMLElement, options: Object): void {
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
    onDialogCancel(): void {
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
    onDialogPost(commentText: string): void {
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
    hideSharedDialog(): void {
        this.lastPointEvent = null;
        this.pendingThreadID = null;

        if (this.createDialog && this.createDialog.isVisible) {
            this.createDialog.hide();
        }
    }

    /** @inheritdoc */
    setupHandlers(): void {
        this.pointClickHandler = this.pointClickHandler.bind(this);

        // Get handlers
        this.pushElementHandler(this.annotatedElement, ['click', 'touchstart'], this.pointClickHandler, true);

        this.pushElementHandler(this.exitButtonEl, 'click', this.toggleMode);
    }

    /** @inheritdoc */
    exit(): void {
        if (this.createDialog) {
            this.createDialog.hide();
        }

        if (this.buttonEl) {
            this.buttonEl.classList.remove(CLASS_ACTIVE);
        }
        this.annotatedElement.classList.remove(CLASS_ANNOTATION_POINT_MODE);

        super.exit();
    }

    /** @inheritdoc */
    enter(): void {
        super.enter();
        replaceHeader(this.container, SELECTOR_POINT_MODE_HEADER);
        this.annotatedElement.classList.add(CLASS_ANNOTATION_POINT_MODE);

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
    pointClickHandler(event: Event): void {
        if (!isInAnnotationOrMarker(event)) {
            event.stopPropagation();
            event.preventDefault();
        }

        // Determine if a point annotation dialog is already open and close the
        // current open dialog
        if (isInDialog(event)) {
            return;
        }

        // Clears and hides the mobile annotation dialog if visible
        if (this.isMobile) {
            this.emit(CONTROLLER_EVENT.resetMobileDialog);
        }

        this.hadPendingThreads = this.destroyPendingThreads();

        // Get annotation location from click event, ignore click if location is invalid
        const location = this.getLocationFromEvent(event, TYPES.point);
        if (!location) {
            this.hideSharedDialog();
            return;
        }

        // Create new thread with no annotations, show indicator, and show dialog
        const thread = this.registerThread([], location, TYPES.point);
        if (!thread) {
            this.hideSharedDialog();
            return;
        }

        if (this.isMobile) {
            this.lastPointEvent = event;
            this.container.appendChild(this.createDialog.containerEl);
            this.createDialog.show(this.container);
            this.createDialog.showCommentBox();
        }

        this.pendingThreadID = thread.threadID;
        thread.show();
        this.registerThread(thread);
        this.emit(THREAD_EVENT.pending, thread.getThreadEventData());
    }

    /** @inheritdoc */
    instantiateThread(params: Object): AnnotationThread {
        switch (this.annotatorType) {
            case ANNOTATOR_TYPE.document:
                return new DocPointThread(params);
            case ANNOTATOR_TYPE.image:
                return new ImagePointThread(params);
            default:
                return null;
        }
    }
}

export default PointModeController;
