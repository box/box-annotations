// @flow
import AnnotationModeController from './AnnotationModeController';
import DocPointThread from '../doc/DocPointThread';
import ImagePointThread from '../image/ImagePointThread';
import { isInDialog, replaceHeader, isInAnnotationOrMarker } from '../util';
import {
    TYPES,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    CLASS_ACTIVE,
    SELECTOR_POINT_MODE_HEADER,
    SELECTOR_ANNOTATION_BUTTON_POINT_EXIT,
    CLASS_ANNOTATION_POINT_MODE,
    ANNOTATOR_TYPE
} from '../constants';

// $FlowFixMe
import shell from './pointShell.html';

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

    /** @inheritdoc */
    setupHandlers(): void {
        // Get handlers
        this.pushElementHandler(this.annotatedElement, ['click', 'touchstart'], this.pointClickHandler, true);

        this.pushElementHandler(this.exitButtonEl, 'click', this.toggleMode);
    }

    /** @inheritdoc */
    exit(): void {
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
    pointClickHandler = (event: Event): void => {
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
        const location = this.getLocation(event, TYPES.point);
        if (!location) {
            return;
        }

        // Create new thread with no annotations, show indicator, and show dialog
        const thread = this.registerThread([], location, TYPES.point);
        if (!thread) {
            return;
        }

        this.pendingThreadID = thread.threadID;
        thread.show();
        this.emit(THREAD_EVENT.pending, thread.getThreadEventData());
    };

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
