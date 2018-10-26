// @flow
import AnnotationModeController from './AnnotationModeController';
import DocDrawingThread from '../doc/DocDrawingThread';
import { replaceHeader, enableElement, disableElement, clearCanvas, findClosestElWithClass, getPageEl } from '../util';
import AnnotationAPI from '../api/AnnotationAPI';
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
    CLASS_ANNOTATION_POINT_MARKER,
    ANNOTATOR_TYPE,
    CLASS_ANNOTATION_LAYER_DRAW_IN_PROGRESS
} from '../constants';

// $FlowFixMe
import shell from './drawingShell.html';

class DrawingModeController extends AnnotationModeController {
    /** @property {AnnotationThread} - The currently selected DrawingThread */
    selectedThread: AnnotationThread;

    /** @property {HTMLElement} - The button to cancel the pending drawing thread */
    cancelButtonEl: HTMLElement;

    /** @property {HTMLElement} - The button to commit the pending drawing thread */
    postButtonEl: HTMLElement;

    /** @property {HTMLElement} - The button to undo a stroke on the pending drawing thread */
    undoButtonEl: HTMLElement;

    /** @property {HTMLElement} - The button to redo a stroke on the pending drawing thread */
    redoButtonEl: HTMLElement;

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

    /** @inheritdoc */
    setupHeader(container: HTMLElement, header: HTMLElement): void {
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
    bindDOMListeners(): void {
        // $FlowFixMe
        this.handleSelection = this.handleSelection.bind(this);
        this.annotatedElement.addEventListener('click', this.handleSelection);
    }

    /** @inheritdoc */
    unbindDOMListeners(): void {
        this.annotatedElement.removeEventListener('click', this.handleSelection);
    }

    /** @inheritdoc */
    bindListeners(): void {
        super.bindListeners();
        this.unbindDOMListeners();
    }

    /** @inheritdoc */
    unbindListeners(): void {
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
    stopPropagation(event: Event): void {
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
    cancelDrawing(): void {
        if (this.currentThread) {
            this.currentThread.destroy();
        }

        this.exit();
    }

    /**
     * Posts drawing annotation
     *
     * @protected
     * @return {void}
     */
    postDrawing(): void {
        if (this.currentThread && this.currentThread.state === STATES.pending) {
            this.currentThread.save(TYPES.draw);
        }

        this.exit();
    }

    /**
     * Undos last drawing
     *
     * @protected
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
     * @protected
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
        this.locationFunction = (event) => this.getLocation(event, TYPES.point);
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
        this.pushElementHandler(this.cancelButtonEl, 'click', this.cancelDrawing);
        this.pushElementHandler(this.postButtonEl, 'click', this.postDrawing);
        this.pushElementHandler(this.undoButtonEl, 'click', this.undoDrawing);
        this.pushElementHandler(this.redoButtonEl, 'click', this.redoDrawing);

        // Mobile & Desktop listeners are bound for touch-enabled laptop edge cases
        // $FlowFixMe
        this.drawingStartHandler = this.drawingStartHandler.bind(this);
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
        const thread = this.registerThread({
            id: AnnotationAPI.generateID(),
            type: this.mode,
            location,
            canAnnotate: true,
            canDelete: true,
            createdBy: this.api.user,
            createdAt: new Date().toLocaleString(),
            isPending: true,
            comments: []
        });

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
        if (this.currentThread) {
            this.currentThread.clearBoundary();
        }

        // Remove any visible boundaries
        const boundaries = this.annotatedElement.querySelectorAll('.ba-drawing-boundary');

        // $FlowFixMe
        boundaries.forEach((boundaryEl) => boundaryEl.parentNode.removeChild(boundaryEl));

        // Clear the in progress drawing canvases
        const pageElements = this.annotatedElement.querySelectorAll('.page');
        pageElements.forEach((pageEl) => clearCanvas(pageEl, CLASS_ANNOTATION_LAYER_DRAW_IN_PROGRESS));

        this.annotatedElement.classList.remove(CLASS_ANNOTATION_DRAW_MODE);
        super.exit();
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

                this.currentThread = undefined;
                this.registerThread(thread);
                this.unbindListeners();

                // Clear existing canvases
                // eslint-disable-next-line
                const pageEl = this.annotatedElement.querySelector(`[data-page-number="${thread.location.page}"]`);
                clearCanvas(pageEl, CLASS_ANNOTATION_LAYER_DRAW_IN_PROGRESS);

                // Do not bind when mode is exited
                if (!this.annotatedElement.classList.contains(CLASS_ANNOTATION_DRAW_MODE)) {
                    return;
                }

                this.bindListeners();

                // Given a location (page change) start drawing at the provided location
                if (eventData && eventData.location) {
                    // $FlowFixMe
                    this.currentThread.handleStart(eventData.location);
                }

                break;
            case THREAD_EVENT.delete:
                if (!thread) {
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
                    this.unregisterThread(thread);
                    thread.destroy();
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
     * @protected
     * @param {Event} event - The event object containing the pointer information
     * @return {DrawingThread} Selected drawing annotation
     */
    handleSelection(event: Event): DrawingThread {
        let selected;

        // NOTE: This is a workaround when buttons are not given precedence in the event chain
        const hasPendingDrawing = this.currentThread && this.currentThread.state === STATES.pending;

        // $FlowFixMe
        if (!event || (event.target && event.target.nodeName === 'BUTTON') || hasPendingDrawing) {
            return selected;
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
     * @private
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
     * @private
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
     * @private
     * @param {number} undoCount - Thenumber of objects that can be undone
     * @param {number} redoCount - Thenumber of objects that can be redone
     * @return {void}
     */
    updateUndoRedoButtonEls(undoCount: number, redoCount: number): void {
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
