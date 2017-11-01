import rbush from 'rbush';
import AnnotationModeController from './AnnotationModeController';
import annotationsShell from './../annotationsShell.html';
import DocDrawingThread from '../doc/DocDrawingThread';
import * as annotatorUtil from '../annotatorUtil';
import {
    TYPES,
    THREAD_EVENT,
    STATES,
    SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL,
    SELECTOR_ANNOTATION_BUTTON_DRAW_POST,
    SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO,
    SELECTOR_ANNOTATION_BUTTON_DRAW_REDO,
    SELECTOR_BOX_PREVIEW_BASE_HEADER,
    SELECTOR_ANNOTATION_DRAWING_HEADER,
    CLASS_ANNNOTATION_DRAWING_BACKGROUND,
    DRAW_BORDER_OFFSET,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    ANNOTATOR_EVENT
} from '../annotationConstants';

class DrawingModeController extends AnnotationModeController {
    /** @property {DrawingThread} - The currently selected DrawingThread */
    selectedThread;

    /** @property {HTMLElement} - The button to cancel the pending drawing thread */
    cancelButtonEl;

    /** @property {HTMLElement} - The button to commit the pending drawing thread */
    postButtonEl;

    /** @property {HTMLElement} - The button to undo a stroke on the pending drawing thread */
    undoButtonEl;

    /** @property {HTMLElement} - The button to redo a stroke on the pending drawing thread */
    redoButtonEl;

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
        // light, dark, or no value given), then we want to use our draw header.
        // Otherwise we expect header UI to be handled by Preview’s consumer
        if (data.header !== 'none') {
            this.setupHeader(this.container, annotationsShell);
        }

        this.cancelButtonEl = this.getButton(SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL);
        this.postButtonEl = this.getButton(SELECTOR_ANNOTATION_BUTTON_DRAW_POST);
        this.undoButtonEl = this.getButton(SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO);
        this.redoButtonEl = this.getButton(SELECTOR_ANNOTATION_BUTTON_DRAW_REDO);
    }

    /**
     * Disables the specified annotation mode
     *
     * @inheritdoc
     * @return {void}
     */
    exit() {
        this.emit(ANNOTATOR_EVENT.modeExit, { headerSelector: SELECTOR_BOX_PREVIEW_BASE_HEADER });

        this.annotatedElement.classList.remove(CLASS_ANNOTATION_MODE);
        this.annotatedElement.classList.remove(CLASS_ANNNOTATION_DRAWING_BACKGROUND);

        this.buttonEl.classList.remove(CLASS_ACTIVE);

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
        this.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
        this.annotatedElement.classList.add(CLASS_ANNNOTATION_DRAWING_BACKGROUND);

        this.buttonEl.classList.add(CLASS_ACTIVE);

        this.emit(ANNOTATOR_EVENT.modeEnter, { headerSelector: SELECTOR_ANNOTATION_DRAWING_HEADER });
        this.emit('unbinddomlisteners'); // Disable other annotations
        this.bindListeners(); // Enable mode
    }

    /**
     * Register a thread that has been assigned a location with the controller
     *
     * @inheritdoc
     * @public
     * @param {AnnotationThread} thread - The thread to register with the controller
     * @return {void}
     */
    registerThread(thread) {
        if (!thread || !thread.location) {
            return;
        }

        const page = thread.location.page || 1; // Defaults to page 1 if thread has no page'
        if (!(page in this.threads)) {
            /* eslint-disable new-cap */
            this.threads[page] = new rbush();
            /* eslint-enable new-cap */
        }
        this.threads[page].insert(thread);
        this.emit('registerthread', thread);
        thread.addListener('threadevent', (data) => {
            this.handleThreadEvents(thread, data);
        });
    }

    /**
     * Unregister a previously registered thread that has been assigned a location
     *
     * @inheritdoc
     * @public
     * @param {AnnotationThread} thread - The thread to unregister with the controller
     * @return {void}
     */
    unregisterThread(thread) {
        if (!thread || !thread.location) {
            return;
        }

        const page = thread.location.page || 1; // Defaults to page 1 if thread has no page'
        if (!(page in this.threads)) {
            /* eslint-disable new-cap */
            this.threads[page] = new rbush();
            /* eslint-enable new-cap */
        }
        this.threads[page].remove(thread);
        this.emit('unregisterthread', thread);
        thread.removeListener('threadevent', this.handleThreadEvents);
    }

    /**
     * Unbind drawing mode listeners. Resets the undo and redo buttons to be disabled if they exist
     *
     * @inheritdoc
     * @protected
     * @return {void}
     */
    unbindListeners() {
        super.unbindListeners();

        annotatorUtil.disableElement(this.undoButtonEl);
        annotatorUtil.disableElement(this.redoButtonEl);
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
        /* eslint-disable require-jsdoc */
        const locationFunction = (event) => this.annotator.getLocationFromEvent(event, TYPES.point);
        /* eslint-enable require-jsdoc */

        // Setup
        const threadParams = this.annotator.getThreadParams([], {}, TYPES.draw);
        this.currentThread = new DocDrawingThread(threadParams);
        this.currentThread.addListener('threadevent', (data) => {
            this.handleThreadEvents(this.currentThread, data);
        });

        // Get handlers
        this.pushElementHandler(
            this.annotatedElement,
            ['mousemove', 'touchmove'],
            annotatorUtil.eventToLocationHandler(locationFunction, this.currentThread.handleMove)
        );

        this.pushElementHandler(
            this.annotatedElement,
            ['mousedown', 'touchstart'],
            annotatorUtil.eventToLocationHandler(locationFunction, this.currentThread.handleStart)
        );

        this.pushElementHandler(
            this.annotatedElement,
            ['mouseup', 'touchcancel', 'touchend'],
            annotatorUtil.eventToLocationHandler(locationFunction, this.currentThread.handleStop)
        );

        this.pushElementHandler(this.cancelButtonEl, 'click', () => {
            this.currentThread.cancelUnsavedAnnotation();
            this.toggleMode();
        });

        this.pushElementHandler(this.postButtonEl, 'click', () => {
            this.currentThread.saveAnnotation(TYPES.draw);
            this.toggleMode();
        });

        this.pushElementHandler(this.undoButtonEl, 'click', this.currentThread.undo);
        this.pushElementHandler(this.redoButtonEl, 'click', this.currentThread.redo);
    }

    /**
     * Handle an annotation event.
     *
     * @inheritdoc
     * @protected
     * @param {AnnotationThread} thread - The thread that emitted the event
     * @param {Object} data - Extra data related to the annotation event
     * @return {void}
     */
    handleThreadEvents(thread, data = {}) {
        const { eventData } = data;
        switch (data.event) {
            case 'locationassigned':
                // Register the thread to the threadmap when a starting location is assigned. Should only occur once.
                this.registerThread(thread);
                break;
            case 'softcommit':
                // Save the original thread, create a new thread and
                // start drawing at the location indicating the page change
                this.currentThread = undefined;
                thread.saveAnnotation(TYPES.draw);
                this.unbindListeners();
                this.bindListeners();

                // Given a location (page change) start drawing at the provided location
                if (eventData && eventData.location) {
                    this.currentThread.handleStart(eventData.location);
                }

                break;
            case 'dialogdelete':
                if (thread.state === STATES.pending) {
                    // Soft delete, in-progress thread doesn't require a redraw or a delete on the server
                    // Clear in-progress thread and restart drawing
                    thread.destroy();
                    this.unbindListeners();
                    this.bindListeners();
                } else {
                    thread.deleteThread();
                    this.unregisterThread(thread);

                    // Redraw any threads that the deleted thread could have been overlapping
                    const page = thread.location.page;
                    this.threads[page].all().forEach((drawingThread) => drawingThread.show());
                }

                break;
            case 'availableactions':
                this.updateUndoRedoButtonEls(eventData.undo, eventData.redo);
                break;
            case THREAD_EVENT.save:
                this.registerThread(thread);
                break;
            case THREAD_EVENT.delete:
                this.unregisterThread(thread);
                break;
            default:
        }
    }

    /**
     * Find the selected drawing threads given a pointer event. Randomly picks one if multiple drawings overlap
     *
     * @protected
     * @param {Event} event - The event object containing the pointer information
     * @return {void}
     */
    handleSelection(event) {
        // NOTE: @jpress This is a workaround when buttons are not given precedence in the event chain
        if (!event || (event.target && event.target.nodeName === 'BUTTON')) {
            return;
        }

        const location = this.annotator.getLocationFromEvent(event, TYPES.point);
        if (!location) {
            return;
        }

        const eventBoundary = {
            minX: +location.x - DRAW_BORDER_OFFSET,
            minY: +location.y - DRAW_BORDER_OFFSET,
            maxX: +location.x + DRAW_BORDER_OFFSET,
            maxY: +location.y + DRAW_BORDER_OFFSET
        };

        // Get the threads that correspond to the point that was clicked on
        const intersectingThreads = this.threads[location.page].search(eventBoundary);

        // Clear boundary on previously selected thread
        this.removeSelection();

        // Selected a region with no drawing threads, remove the reference to the previously selected thread
        if (intersectingThreads.length === 0) {
            this.selectedThread = undefined;
            return;
        }

        // Randomly select a thread in case there are multiple overlapping threads (use canvas hitmap to avoid this)
        const index = Math.floor(Math.random() * intersectingThreads.length);
        const selected = intersectingThreads[index];
        this.select(selected);
    }

    /**
     * Deselect a saved and selected thread
     *
     * @private
     * @return {void}
     */
    removeSelection() {
        if (!this.selectedThread) {
            return;
        }

        this.selectedThread.clearBoundary();
        this.selectedThread = undefined;
    }

    /**
     * Select the indicated drawing thread. Deletes a drawing thread upon the second consecutive selection
     *
     * @private
     * @param {DrawingThread} selectedDrawingThread - The drawing thread to select
     * @return {void}
     */
    select(selectedDrawingThread) {
        selectedDrawingThread.drawBoundary();
        this.selectedThread = selectedDrawingThread;
    }

    /**
     * Toggle the undo and redo buttons based on the number of actions available
     *
     * @private
     * @param {number} undoCount - The number of objects that can be undone
     * @param {number} redoCount - The number of objects that can be redone
     * @return {void}
     */
    updateUndoRedoButtonEls(undoCount, redoCount) {
        if (this.undoButtonEl) {
            if (undoCount === 1) {
                annotatorUtil.enableElement(this.undoButtonEl);
            } else if (undoCount === 0) {
                annotatorUtil.disableElement(this.undoButtonEl);
            }
        }

        if (this.redoButtonEl) {
            if (redoCount === 1) {
                annotatorUtil.enableElement(this.redoButtonEl);
            } else if (redoCount === 0) {
                annotatorUtil.disableElement(this.redoButtonEl);
            }
        }
    }
}

export default DrawingModeController;
