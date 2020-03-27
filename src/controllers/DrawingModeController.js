// @flow
import AnnotationModeController from './AnnotationModeController';
import DocDrawingThread from '../doc/DocDrawingThread';
import { replaceHeader, enableElement, disableElement, clearCanvas, findClosestElWithClass, getPageEl } from '../util';
import AnnotationAPI from '../api/AnnotationAPI';
import {
    TYPES,
    STATES,
    THREAD_EVENT,
    SELECTOR_DRAW_MODE_HEADER,
    CLASS_ANNOTATION_LAYER_DRAW,
    CLASS_ANNOTATION_DRAW_MODE,
    CLASS_ANNOTATION_POINT_MARKER,
    ANNOTATOR_TYPE,
    CLASS_ANNOTATION_LAYER_DRAW_IN_PROGRESS,
} from '../constants';

// $FlowFixMe
import shell from './drawingShell.html';

class DrawingModeController extends AnnotationModeController {
    /** @property {AnnotationThread} - The currently selected DrawingThread */
    selectedThread: AnnotationThread;

    /** @property {AnnotationThread} */
    currentThread: AnnotationThread;

    /** @property {Function} */
    locationFunction: Function;

    /** @inheritdoc */
    init(data: Object): void {
        super.init(data);

        // If the header coming from the preview options is not none (e.g.
        // light, dark, or no value given), then we want to use our draw
        // header. Otherwise we expect header UI to be handled by Preview’s
        // consumer
        if (data.options.header !== 'none' || this.headerElement) {
            this.setupHeader(this.headerElement, shell);
        }
    }

    /**
     * Prevents click events from triggering other annotation types
     *
     * @param {Event} event - Mouse event
     * @return {void}
     */
    stopPropagation(event: Event): void {
        const el = findClosestElWithClass(event.target, CLASS_ANNOTATION_POINT_MARKER);
        if (el) {
            event.stopPropagation();
        }
    }

    /**
     * Cancels drawing annotation
     *
     * @return {void}
     */
    cancelDrawing(): void {
        if (this.currentThread) {
            this.destroyThread(this.currentThread);
        }

        this.exit();
    }

    /**
     * Posts drawing annotation
     *
     * @return {void}
     */
    postDrawing(): void {
        if (
            this.currentThread &&
            this.currentThread.state === STATES.pending &&
            this.currentThread.pathContainer &&
            this.currentThread.pathContainer.undoStack.length > 0
        ) {
            this.currentThread.save(TYPES.draw);
        }

        this.exit();
    }

    /**
     * Undos last drawing
     *
     * @return {void}
     */
    undoDrawing(): void {
        if (this.currentThread) {
            this.currentThread.undo();
        }
    }

    /**
     * Redos last undone drawing annotation
     *
     * @return {void}
     */
    redoDrawing(): void {
        if (this.currentThread) {
            this.currentThread.redo();
        }
    }

    /** @inheritdoc */
    setupHandlers(): void {
        /* eslint-disable require-jsdoc */
        this.locationFunction = event => this.getLocation(event, TYPES.point);
        this.locationFunction = this.locationFunction.bind(this);
        /* eslint-enable require-jsdoc */

        // $FlowFixMe
        this.stopPropagation = this.stopPropagation.bind(this);
        // $FlowFixMe
        this.cancelDrawing = this.cancelDrawing.bind(this);
        // $FlowFixMe
        this.postDrawing = this.postDrawing.bind(this);
        // $FlowFixMe
        this.undoDrawing = this.undoDrawing.bind(this);
        // $FlowFixMe
        this.redoDrawing = this.redoDrawing.bind(this);
        // $FlowFixMe
        this.drawingStartHandler = this.drawingStartHandler.bind(this);

        this.pushElementHandler(this.annotatedElement, 'click', this.stopPropagation, true);

        // Both click and touch listeners are bound for touch-enabled laptop edge cases
        this.pushElementHandler(this.annotatedElement, ['mousedown', 'touchstart'], this.drawingStartHandler, true);
    }

    /**
     * Start a drawing stroke
     *
     * @param {Event} event - DOM event
     * @return {void}
     */
    drawingStartHandler(event: Event): void {
        // $FlowFixMe
        if (event.target && event.target.nodeName === 'BUTTON') {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        this.removeSelection();

        // Get annotation location from click event, ignore click if location is invalid
        const location = this.getLocation(event, TYPES.point);
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
        const threadParams = this.getThreadParams({
            id: AnnotationAPI.generateID(),
            type: this.mode,
            location,
            canAnnotate: true,
            canDelete: true,
            createdBy: this.api.user,
            createdAt: new Date().toISOString(),
            isPending: true,
            comments: [],
        });

        if (!threadParams) {
            return;
        }

        const thread = this.instantiateThread(threadParams);

        if (!thread) {
            return;
        }

        this.currentThread = thread;
        this.emit(THREAD_EVENT.pending, thread.getThreadEventData());
        thread.bindDrawingListeners(this.locationFunction);

        thread.addListener('threadevent', data => this.handleThreadEvents(thread, data));
        thread.handleStart(location);
    }

    /** @inheritdoc */
    resetMode() {
        if (this.currentThread) {
            this.currentThread.clearBoundary();
        }

        // Remove any visible boundaries
        const boundaries = this.annotatedElement.querySelectorAll('.ba-drawing-boundary');

        // $FlowFixMe
        boundaries.forEach(boundaryEl => boundaryEl.parentNode.removeChild(boundaryEl));

        // Clear the in progress drawing canvases
        const pageElements = this.annotatedElement.querySelectorAll('.page');
        pageElements.forEach(pageEl => clearCanvas(pageEl, CLASS_ANNOTATION_LAYER_DRAW_IN_PROGRESS));

        this.annotatedElement.classList.remove(CLASS_ANNOTATION_DRAW_MODE);
    }

    /**
     * Enables the specified annotation mode
     *
     * @return {void}
     */
    enter(): void {
        super.enter();
        replaceHeader(this.headerElement, SELECTOR_DRAW_MODE_HEADER);
        this.annotatedElement.classList.add(CLASS_ANNOTATION_DRAW_MODE);
    }

    /** @inheritdoc */
    handleThreadEvents(thread: AnnotationThread, data: Object = {}): void {
        const { eventData } = data;
        switch (data.event) {
            case THREAD_EVENT.save:
                thread.removeListener('threadevent', this.handleThreadEvents);
                thread.unbindDrawingListeners();

                this.resetCurrentThread(thread);
                this.unbindListeners();

                this.registerThread(thread);

                // Clear existing canvases
                // eslint-disable-next-line
                const pageEl = this.annotatedElement.querySelector(`[data-page-number="${thread.location.page}"]`);
                clearCanvas(pageEl, CLASS_ANNOTATION_LAYER_DRAW_IN_PROGRESS);

                // Do not bind when mode is exited
                if (!this.annotatedElement.classList.contains(CLASS_ANNOTATION_DRAW_MODE)) {
                    return;
                }

                this.bindListeners();

                // Reset undo/redo buttons
                this.updateUndoRedoButtonEls();

                // Given a location (page change) start drawing at the provided location
                if (eventData && eventData.location) {
                    // $FlowFixMe
                    this.currentThread.handleStart(eventData.location);
                } else {
                    this.currentThread = undefined;
                }

                break;
            case THREAD_EVENT.delete:
                if (!thread) {
                    return;
                }

                this.currentThread = undefined;
                thread.removeListener('threadevent', this.handleThreadEvents);
                thread.unbindDrawingListeners();

                // Reset undo/redo buttons
                this.updateUndoRedoButtonEls();

                if (thread.state === STATES.pending) {
                    // Soft delete, in-progress thread doesn't require a redraw or a delete on the server
                    // Clear in-progress thread and restart drawing
                    thread.destroy();
                    this.unbindListeners();
                    this.bindListeners();
                } else {
                    this.destroyThread(thread);
                    this.renderPage(thread.location.page);
                }

                break;
            case 'availableactions':
                this.updateUndoRedoButtonEls(eventData.undo, eventData.redo);
                break;
            default:
        }

        super.handleThreadEvents(thread, data);
    }

    /** @inheritdoc */
    renderPage(pageNum: string): void {
        // Clear existing canvases
        const pageEl = getPageEl(this.annotatedElement, pageNum);
        if (pageEl) {
            clearCanvas(pageEl, CLASS_ANNOTATION_LAYER_DRAW);
            clearCanvas(pageEl, CLASS_ANNOTATION_LAYER_DRAW_IN_PROGRESS);
        }

        super.renderPage(pageNum);
    }

    /**
     * Selects a drawing thread given a pointer event. Randomly picks one if multiple drawings overlap
     *
     * @param {Event} event - The event object containing the pointer information
     * @return {DrawingThread} Selected drawing annotation
     */
    handleSelection(event: Event): DrawingThread {
        let selected;

        // NOTE: This is a workaround when buttons are not given precedence in the event chain
        const hasPendingDrawing = this.currentThread && this.currentThread.state === STATES.pending;

        // $FlowFixMe
        if (!event || (event.target && event.target.nodeName === 'BUTTON') || hasPendingDrawing) {
            return this.currentThread;
        }

        event.stopPropagation();

        // Get the threads that correspond to the point that was clicked on
        const location = this.getLocation(event, TYPES.point);
        const intersectingThreads = this.getIntersectingThreads(event, location);

        // Clear boundary on previously selected thread
        this.removeSelection();

        // Selected a region with no drawing threads, remove the reference to the previously selected thread
        if (intersectingThreads.length === 0) {
            this.selectedThread = undefined;
            return selected;
        }

        // Randomly select a thread in case there are multiple overlapping threads (use canvas hitmap to avoid this)
        const index = Math.floor(Math.random() * intersectingThreads.length);
        selected = intersectingThreads[index];
        this.select(selected);
        return selected;
    }

    /**
     * Deselect a saved and selected thread
     *
     * @return {void}
     */
    removeSelection(): void {
        if (!this.selectedThread) {
            return;
        }

        this.selectedThread.hide();
        this.selectedThread = undefined;
    }

    /**
     * Select the indicated drawing thread. Deletes a drawing thread upon the second consecutive selection
     *
     * @param {DrawingThread} selectedDrawingThread - The drawing thread to select
     * @return {void}
     */
    select(selectedDrawingThread: DrawingThread): void {
        selectedDrawingThread.show();
        selectedDrawingThread.drawBoundary();
        selectedDrawingThread.renderAnnotationPopover();
        this.selectedThread = selectedDrawingThread;
    }

    /**
     * Toggle the undo and redo buttons based on thenumber of actions available
     *
     * @param {number} undoCount - Thenumber of objects that can be undone
     * @param {number} redoCount - Thenumber of objects that can be redone
     * @return {void}
     */
    updateUndoRedoButtonEls(undoCount: number = 0, redoCount: number = 0): void {
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

    /** @inheritdoc */
    instantiateThread(params: Object): DrawingThread {
        return this.annotatorType === ANNOTATOR_TYPE.document ? new DocDrawingThread(params) : null;
    }
}

export default DrawingModeController;
