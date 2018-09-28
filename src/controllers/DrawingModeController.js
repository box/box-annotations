import AnnotationModeController from './AnnotationModeController';
import shell from './drawingShell.html';
import {
    replaceHeader,
    enableElement,
    disableElement,
    clearCanvas,
    hasValidBoundaryCoordinates,
    findClosestElWithClass
} from '../util';
import {
    TYPES,
    STATES,
    THREAD_EVENT,
    SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL,
    SELECTOR_ANNOTATION_BUTTON_DRAW_POST,
    SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO,
    SELECTOR_ANNOTATION_BUTTON_DRAW_REDO,
    SELECTOR_DRAW_MODE_HEADER,
    CLASS_ANNOTATION_LAYER_DRAW,
    CLASS_ANNOTATION_DRAW_MODE,
    CLASS_ANNOTATION_POINT_MARKER
} from '../constants';

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

    /** @inheritdoc */
    init(data) {
        super.init(data);

        // If the header coming from the preview options is not none (e.g.
        // light, dark, or no value given), then we want to use our draw
        // header. Otherwise we expect header UI to be handled by Preview’s
        // consumer
        if (data.options.header !== 'none' || this.headerElement) {
            this.setupHeader(this.headerElement, shell);
        }

        this.handleSelection = this.handleSelection.bind(this);
    }

    /** @inheritdoc */
    setupHeader(container, header) {
        super.setupHeader(container, header);

        this.cancelButtonEl = this.getButton(SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL);
        this.cancelButtonEl.textContent = this.localized.cancelButton;

        this.postButtonEl = this.getButton(SELECTOR_ANNOTATION_BUTTON_DRAW_POST);

        // TODO(@spramod): Remove '||' string, once doneButton is properly localized within Preview
        this.postButtonEl.textContent = this.localized.doneButton || 'Done';

        this.undoButtonEl = this.getButton(SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO);
        this.redoButtonEl = this.getButton(SELECTOR_ANNOTATION_BUTTON_DRAW_REDO);
    }

    /** @inheritdoc */
    bindDOMListeners() {
        if (this.hasTouch) {
            this.annotatedElement.addEventListener('touchstart', this.handleSelection);
        }

        if (!this.isMobile) {
            this.annotatedElement.addEventListener('click', this.handleSelection);
        }
    }

    /** @inheritdoc */
    unbindDOMListeners() {
        if (this.hasTouch) {
            this.annotatedElement.removeEventListener('touchstart', this.handleSelection);
        }

        if (!this.isMobile) {
            this.annotatedElement.removeEventListener('click', this.handleSelection);
        }
    }

    /** @inheritdoc */
    bindListeners() {
        super.bindListeners();
        this.unbindDOMListeners();
    }

    /** @inheritdoc */
    unbindListeners() {
        super.unbindListeners();
        this.bindDOMListeners();

        disableElement(this.undoButtonEl);
        disableElement(this.redoButtonEl);
    }

    /**
     * Prevents click events from triggering other annotation types
     *
     * @protected
     * @param {Event} event - Mouse event
     * @return {void}
     */
    stopPropagation(event) {
        const el = findClosestElWithClass(event.target, CLASS_ANNOTATION_POINT_MARKER);
        if (el) {
            event.stopPropagation();
        }
    }

    /**
     * Cancels drawing annotation
     *
     * @protected
     * @return {void}
     */
    cancelDrawing() {
        if (this.currentThread) {
            this.currentThread.cancelUnsavedAnnotation();
        }

        this.currentThread = undefined;
        this.toggleMode();
    }

    /**
     * Posts drawing annotation
     *
     * @protected
     * @return {void}
     */
    postDrawing() {
        if (this.currentThread && this.currentThread.state === STATES.pending) {
            this.saveThread(this.currentThread);
        }

        this.currentThread = undefined;
        this.toggleMode();
    }

    /**
     * Undos last drawing
     *
     * @protected
     * @return {void}
     */
    undoDrawing() {
        if (this.currentThread) {
            this.currentThread.undo();
        }
    }

    /**
     * Redos last undone drawing annotation
     *
     * @protected
     * @return {void}
     */
    redoDrawing() {
        if (this.currentThread) {
            this.currentThread.redo();
        }
    }

    /** @inheritdoc */
    setupHandlers() {
        /* eslint-disable require-jsdoc */
        this.locationFunction = (event) => this.annotator.getLocationFromEvent(event, TYPES.point);
        /* eslint-enable require-jsdoc */

        this.stopPropagation = this.stopPropagation.bind(this);
        this.drawingStartHandler = this.drawingStartHandler.bind(this);
        this.cancelDrawing = this.cancelDrawing.bind(this);
        this.postDrawing = this.postDrawing.bind(this);
        this.undoDrawing = this.undoDrawing.bind(this);
        this.redoDrawing = this.redoDrawing.bind(this);

        this.pushElementHandler(this.annotatedElement, 'click', this.stopPropagation, true);
        this.pushElementHandler(this.cancelButtonEl, 'click', this.cancelDrawing);
        this.pushElementHandler(this.postButtonEl, 'click', this.postDrawing);
        this.pushElementHandler(this.undoButtonEl, 'click', this.undoDrawing);
        this.pushElementHandler(this.redoButtonEl, 'click', this.redoDrawing);

        // Mobile & Desktop listeners are bound for touch-enabled laptop edge cases
        this.pushElementHandler(this.annotatedElement, ['mousedown', 'touchstart'], this.drawingStartHandler, true);
    }

    /**
     * Start a drawing stroke
     *
     * @param {Event} event - DOM event
     * @return {void}
     */
    drawingStartHandler(event) {
        event.stopPropagation();
        event.preventDefault();

        // Get annotation location from click event, ignore click if location is invalid
        const location = this.annotator.getLocationFromEvent(event, TYPES.point);
        if (!location) {
            return;
        }

        if (this.currentThread) {
            this.currentThread.handleStart(location);
            return;
        }

        // Add initial drawing boundary based on starting location
        location.minX = location.x;
        location.maxX = location.x;
        location.minY = location.y;
        location.maxY = location.y;

        // Create new thread with no annotations, show indicator, and show dialog
        const thread = this.annotator.createAnnotationThread([], location, TYPES.draw);
        if (!thread) {
            return;
        }

        this.currentThread = thread;
        this.emit(THREAD_EVENT.pending, thread.getThreadEventData());
        thread.bindDrawingListeners(this.locationFunction);
        thread.addListener('threadevent', (data) => this.handleThreadEvents(thread, data));
        thread.handleStart(location);
    }

    /** @inheritdoc */
    exit() {
        this.annotatedElement.classList.remove(CLASS_ANNOTATION_DRAW_MODE);
        super.exit();
    }

    /**
     * Enables the specified annotation mode
     *
     * @return {void}
     */
    enter() {
        super.enter();
        replaceHeader(this.headerElement, SELECTOR_DRAW_MODE_HEADER);
        this.annotatedElement.classList.add(CLASS_ANNOTATION_DRAW_MODE);
    }

    /** @inheritdoc */
    handleThreadEvents(thread, data = {}) {
        const { eventData } = data;
        switch (data.event) {
            case 'softcommit':
                thread.removeListener('threadevent', this.handleThreadEvents);
                thread.unbindDrawingListeners();

                this.currentThread = undefined;
                this.saveThread(thread);
                this.unbindListeners();
                this.bindListeners();

                // Given a location (page change) start drawing at the provided location
                if (eventData && eventData.location) {
                    this.currentThread.handleStart(eventData.location);
                }

                break;
            case 'dialogdelete':
                if (!thread || !thread.dialog) {
                    return;
                }

                this.currentThread = undefined;
                thread.removeListener('threadevent', this.handleThreadEvents);
                thread.unbindDrawingListeners();

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
                    const { page } = thread.location;
                    this.threads[page].all().forEach((drawingThread) => drawingThread.show());
                }

                break;
            case 'availableactions':
                this.updateUndoRedoButtonEls(eventData.undo, eventData.redo);
                break;
            default:
        }

        super.handleThreadEvents(thread, data);
    }

    /**
     * Selects a drawing thread given a pointer event. Randomly picks one if multiple drawings overlap
     *
     * @protected
     * @param {Event} event - The event object containing the pointer information
     * @return {void}
     */
    handleSelection(event) {
        // NOTE: This is a workaround when buttons are not given precedence in the event chain
        const hasPendingDrawing = this.currentThread && this.currentThread.state === STATES.pending;
        if (!event || (event.target && event.target.nodeName === 'BUTTON') || hasPendingDrawing) {
            return;
        }

        event.stopPropagation();

        // Get the threads that correspond to the point that was clicked on
        const intersectingThreads = this.getIntersectingThreads(event);

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

    /** @inheritdoc */
    renderPage(pageNum) {
        // Clear context if needed
        const pageEl = this.annotatedElement.querySelector(`[data-page-number="${pageNum}"]`);
        clearCanvas(pageEl, CLASS_ANNOTATION_LAYER_DRAW);

        if (!this.threads || !this.threads[pageNum]) {
            return;
        }

        const pageThreads = this.threads[pageNum].all() || [];
        pageThreads.forEach((thread) => thread.show());
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
                enableElement(this.undoButtonEl);
            } else if (undoCount === 0) {
                disableElement(this.undoButtonEl);
            }
        }

        if (this.redoButtonEl) {
            if (redoCount === 1) {
                enableElement(this.redoButtonEl);
            } else if (redoCount === 0) {
                disableElement(this.redoButtonEl);
            }
        }
    }

    /**
     * Save the original thread and create a new thread
     *
     * @private
     * @param {AnnotationThread} thread The thread that emitted the event
     * @return {void}
     */
    saveThread(thread) {
        if (!thread || !hasValidBoundaryCoordinates(thread)) {
            return;
        }

        thread.saveAnnotation(TYPES.draw);
        this.registerThread(thread);
    }
}

export default DrawingModeController;
