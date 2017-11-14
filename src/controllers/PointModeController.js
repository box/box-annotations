import AnnotationModeController from './AnnotationModeController';
import { TYPES, THREAD_EVENT, CONTROLLER_EVENT } from '../annotationConstants';

class PointModeController extends AnnotationModeController {
    /** @property {HTMLElement} - The button to cancel the pending thread */
    cancelButtonEl;

    /** @property {HTMLElement} - The button to commit the pending thread */
    postButtonEl;

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

        if (thread) {
            thread.show();
            this.registerThread(thread);
        }

        this.emit(THREAD_EVENT.pending, thread.getThreadEventData());
    }
}

export default PointModeController;
