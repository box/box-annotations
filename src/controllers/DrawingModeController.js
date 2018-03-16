import AnnotationModeController from './AnnotationModeController';
import shell from './drawingShell.html';
import DocDrawingThread from '../doc/DocDrawingThread';
import {
    replaceHeader,
    enableElement,
    disableElement,
    eventToLocationHandler,
    clearCanvas,
    hasValidBoundaryCoordinates
} from '../util';
import {
    TYPES,
    STATES,
    SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL,
    SELECTOR_ANNOTATION_BUTTON_DRAW_POST,
    SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO,
    SELECTOR_ANNOTATION_BUTTON_DRAW_REDO,
    SELECTOR_DRAW_MODE_HEADER,
    CLASS_ANNOTATION_LAYER_DRAW
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
        if (data.options.header !== 'none') {
            this.setupHeader(this.container, shell);
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
        if (this.isMobile && this.hasTouch) {
            this.annotatedElement.addEventListener('touchstart', this.handleSelection);
        } else {
            this.annotatedElement.addEventListener('click', this.handleSelection);
        }
    }

    /** @inheritdoc */
    unbindDOMListeners() {
        if (this.isMobile && this.hasTouch) {
            this.annotatedElement.removeEventListener('touchstart', this.handleSelection);
        } else {
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

    /** @inheritdoc */
    setupHandlers() {
        /* eslint-disable require-jsdoc */
        const locationFunction = (event) => this.annotator.getLocationFromEvent(event, TYPES.point);
        /* eslint-enable require-jsdoc */

        // Setup
        const threadParams = this.annotator.getThreadParams([], {}, TYPES.draw);
        this.currentThread = new DocDrawingThread(threadParams);
        this.currentThread.addListener('threadevent', (data) => {
            const thread = this.currentThread || this.selectedThread;
            this.handleThreadEvents(thread, data);
        });

        // Get handlers
        this.pushElementHandler(
            this.annotatedElement,
            ['mousemove', 'touchmove'],
            eventToLocationHandler(locationFunction, this.currentThread.handleMove)
        );

        this.pushElementHandler(
            this.annotatedElement,
            ['mousedown', 'touchstart'],
            eventToLocationHandler(locationFunction, this.currentThread.handleStart)
        );

        this.pushElementHandler(
            this.annotatedElement,
            ['mouseup', 'touchcancel', 'touchend'],
            eventToLocationHandler(locationFunction, this.currentThread.handleStop)
        );

        this.pushElementHandler(this.cancelButtonEl, 'click', () => {
            if (this.currentThread) {
                this.currentThread.cancelUnsavedAnnotation();
            }
            this.toggleMode();
        });

        this.pushElementHandler(this.postButtonEl, 'click', () => {
            if (this.currentThread && this.currentThread.state === STATES.pending) {
                this.saveThread(this.currentThread);
            }

            this.toggleMode();
        });

        this.pushElementHandler(this.undoButtonEl, 'click', this.currentThread.undo);
        this.pushElementHandler(this.redoButtonEl, 'click', this.currentThread.redo);
    }

    /**
     * Enables the specified annotation mode
     *
     * @return {void}
     */
    enter() {
        super.enter();
        replaceHeader(this.container, SELECTOR_DRAW_MODE_HEADER);
    }

    /** @inheritdoc */
    handleThreadEvents(thread, data = {}) {
        const { eventData } = data;
        switch (data.event) {
            case 'softcommit':
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
        // NOTE: @jpress This is a workaround when buttons are not given precedence in the event chain
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
