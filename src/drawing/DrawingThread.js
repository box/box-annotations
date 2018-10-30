import AnnotationThread from '../AnnotationThread';
import DrawingPath from './DrawingPath';
import DrawingContainer from './DrawingContainer';
import { eventToLocationHandler } from '../util';
import {
    STATES,
    DRAW_STATES,
    DRAW_RENDER_THRESHOLD,
    DRAW_BASE_LINE_WIDTH,
    BORDER_OFFSET,
    THREAD_EVENT
} from '../constants';

class DrawingThread extends AnnotationThread {
    /** @property {number} - Drawing state */
    drawingFlag = DRAW_STATES.idle;

    /** @property {DrawingContainer} - The path container supporting undo and redo */
    pathContainer = new DrawingContainer();

    /** @property {DrawingPath} - The path being drawn but not yet finalized */
    pendingPath;

    /** @property {CanvasContext} - The context to draw in-progress drawings on */
    drawingContext;

    /** @property {CanvasContext} - The context to draw saved drawings on on */
    concreteContext;

    /** @property {number} - Timestamp of the last render */
    lastRenderTimestamp;

    /** @property {number} - The the last animation frame request id */
    lastAnimationRequestId;

    /** @property {number} - The scale factor that the drawing thread was last rendered at */
    lastScaleFactor;

    /** @property {number} - The minimum X coordinate occupied by the contained drawing paths */
    minX;

    /** @property {number} - The minimum Y coordinate occupied by the contained drawing paths */
    minY;

    /** @property {number} - The maximum X coordinate occupied by the contained drawing paths */
    maxX;

    /** @property {number} - The maximum Y coordinate occupied by the contained drawing paths */
    maxY;

    /**
     * [constructor]
     *
     * @inheritdoc
     * @param {AnnotationThreadData} data - Data for constructing thread
     * @return {DrawingThread} Drawing annotation thread instance
     */
    constructor(data) {
        super(data);

        // Default drawing thread state to inactive until user begins drawing
        this.state = STATES.inactive;

        this.render = this.render.bind(this);
        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
        this.canComment = false;

        // Recreate stored paths
        if (this.location && this.location.paths) {
            this.regenerateBoundary();

            if (this.pathContainer.isEmpty()) {
                this.unmountPopover();
            }

            this.location.paths.forEach((drawingPathData) => {
                const pathInstance = new DrawingPath(drawingPathData);
                this.pathContainer.insert(pathInstance);
            });
        }
    }

    /**
     * Destructor for a drawing thread object.
     *
     * [destructor]
     * @inheritdoc
     * @return {void}
     */
    destroy() {
        if (this.lastAnimationRequestId) {
            window.cancelAnimationFrame(this.lastAnimationRequestId);
        }

        if (this.state !== STATES.pending) {
            this.emit(THREAD_EVENT.render, this.location.page);
        }

        this.unmountPopover();
        this.reset();
        super.destroy();
    }

    /**
     * Reset the state of the thread and clear any drawn boundary
     *
     * @return {void}
     */
    reset() {
        super.reset();

        this.clearBoundary();
    }

    /**
     * Binds DOM event listeners for drawing new thread using
     * mode specific location getter
     *
     * @param {Function} locationFunction - Location getter method
     * @return {void}
     */
    bindDrawingListeners(locationFunction) {
        if (this.hasTouch) {
            this.annotatedElement.addEventListener(
                'touchmove',
                eventToLocationHandler(locationFunction, this.handleMove)
            );
            this.annotatedElement.addEventListener(
                'touchcancel',
                eventToLocationHandler(locationFunction, this.handleStop)
            );
            this.annotatedElement.addEventListener(
                'touchend',
                eventToLocationHandler(locationFunction, this.handleStop)
            );
        } else {
            this.annotatedElement.addEventListener(
                'mousemove',
                eventToLocationHandler(locationFunction, this.handleMove)
            );
            this.annotatedElement.addEventListener(
                'mouseup',
                eventToLocationHandler(locationFunction, this.handleStop)
            );
        }
    }

    /**
     * Unbinds DOM event listeners for drawing new threads.
     *
     * @return {void}
     */
    unbindDrawingListeners() {
        this.annotatedElement.removeEventListener('mousemove', eventToLocationHandler);
        this.annotatedElement.removeEventListener('mouseup', eventToLocationHandler);

        this.annotatedElement.removeEventListener('touchmove', eventToLocationHandler);
        this.annotatedElement.removeEventListener('touchcancel', eventToLocationHandler);
        this.annotatedElement.removeEventListener('touchend', eventToLocationHandler);
    }

    /* eslint-disable no-unused-vars */
    /**
     * Handle a pointer movement
     *
     * @param {Object} location - The location information of the pointer
     * @return {void}
     */
    handleMove(location) {}

    /**
     * Start a drawing stroke *
     *
     * @param {Object} location - The location information of the pointer
     * @return {void}
     */
    handleStart(location) {}

    /**
     * End a drawing stroke
     *
     * @param {Object} location - The location information of the pointer
     * @return {void}
     */
    handleStop(location) {}
    /* eslint-disable no-unused-vars */

    /**
     * Delete a saved drawing thread by deleting each annotation
     * and then clearing the concrete context, boundary, and destroying its path.
     *
     * @return {void}
     */
    deleteThread() {
        this.comments.forEach((annotation) => this.delete(annotation));

        // Calculate the bounding rectangle
        const [x, y, width, height] = this.getBrowserRectangularBoundary();

        // Clear the drawn thread and its boundary
        if (this.concreteContext) {
            this.concreteContext.clearRect(
                x - BORDER_OFFSET,
                y + BORDER_OFFSET,
                width + BORDER_OFFSET * 2,
                height - BORDER_OFFSET * 2
            );
        }

        this.clearBoundary();

        this.pathContainer.destroy();
        this.pathContainer = null;
    }

    /**
     * Set the drawing styles for a provided context. Sets the context of the in-progress context if
     * no other context is provided.
     *
     * @param {Object} config - The configuration Object
     * @param {number} config.scale - The document scale
     * @param {string} config.color - The brush color
     * @param {CanvasContext} [context] - Optional context provided to be styled
     * @return {void}
     */
    setContextStyles(config, context) {
        if (!this.drawingContext && !context) {
            return;
        }

        const { scale, color } = config;
        const contextToSet = context || this.drawingContext;

        contextToSet.lineCap = 'round';
        contextToSet.lineJoin = 'round';
        contextToSet.strokeStyle = color || 'black';
        contextToSet.lineWidth = DRAW_BASE_LINE_WIDTH * (scale || 1);
    }

    /**
     * Overturns the last drawing stroke if it exists. Emits thenumber of undo and redo
     * actions available if an undo was executed.
     *
     * @return {void}
     */
    undo() {
        const executedUndo = this.pathContainer.undo();
        if (executedUndo) {
            this.draw(this.drawingContext, true);
            this.updateBoundary();
            this.regenerateBoundary();

            if (this.pathContainer.isEmpty()) {
                this.unmountPopover();
            }

            this.drawBoundary();
            this.emitAvailableActions();
        }
    }

    /**
     * Replays the last undone drawing stroke if it exists. Emits thenumber of undo and redo
     * actions available if a redraw was executed.
     *
     * @return {void}
     */
    redo() {
        const executedRedo = this.pathContainer.redo();
        if (executedRedo) {
            this.draw(this.drawingContext, true);
            this.updateBoundary();
            this.regenerateBoundary();

            if (this.pathContainer.isEmpty()) {
                this.unmountPopover();
            }

            this.drawBoundary();
            this.emitAvailableActions();
        }
    }


    /**
     * Sets up the thread state.
     *
     * @return {void}
     */
    setup() {
        if (this.threadNumber) {
            // Saved thread, load boundary dialog
            this.state = STATES.inactive;
        } else {
            // Newly created thread
            this.state = STATES.pending;
        }
    }

    /**
     * Draws the paths in the thread onto the given context.
     *
     * @param {CanvasContext} context - The context to draw on
     * @param {boolean} [clearCanvas] - A flag to clear the canvas before drawing.
     * @return {void}
     */
    draw(context, clearCanvas = false) {
        if (!context) {
            return;
        }

        /* OPTIMIZE (@minhnguyen): Render only what has been obstructed by the new drawing
         *           rather than every single line in the thread. If we do end
         *           up splitting saves into multiple requests, we can buffer
         *           the amount of re-renders onto a temporary memory canvas.
         */
        if (clearCanvas) {
            const { canvas } = context;
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        context.beginPath();
        this.pathContainer.applyToItems((drawing) => drawing.drawPath(context));
        if (this.pendingPath && !this.pendingPath.isEmpty()) {
            this.pendingPath.drawPath(context);
        }

        context.stroke();
    }

    /**
     * Emit an event containing thenumber of undo and redo actions that can be done.
     *
     * @return {void}
     */
    emitAvailableActions() {
        const availableActions = this.pathContainer.getNumberOfItems();
        this.emit('availableactions', {
            undo: availableActions.undoCount,
            redo: availableActions.redoCount
        });
    }

    /**
     * Clears any existing boundaries and re-redraws a new boundary around the drawing annotation
     *
     * @return {void}
     */
    drawBoundary() {
        this.clearBoundary();
    }

    /**
     * Draw the pending path onto the DrawingThread CanvasContext. Should be used
     * in conjunction with requestAnimationFrame. Does nothing when there is drawingContext set.
     *
     * @param {number} timestamp - The time when the function was called;
     * @return {void}
     */
    render(timestamp = window.performance.now()) {
        let renderAgain = true;

        const elapsed = timestamp - (this.lastRenderTimestamp || 0);
        if (elapsed >= DRAW_RENDER_THRESHOLD) {
            this.draw(this.drawingContext, true);

            this.lastRenderTimestamp = timestamp;
            renderAgain = this.drawingFlag === DRAW_STATES.drawing;
        }

        if (!renderAgain) {
            return;
        }

        this.lastAnimationRequestId = window.requestAnimationFrame(this.render);
    }

    /** @inheritdoc */
    renderAnnotationPopover() {
        this.drawBoundary();
        super.renderAnnotationPopover();
    }

    /** @inheritdoc */
    updateBoundary(item) {
        // Recompute the entire AABB when no item is provided, check a new item if provided
        const boundaryData = !item
            ? this.pathContainer.getAxisAlignedBoundingBox()
            : DrawingPath.extractDrawingInfo(item, this.location);

        Object.assign(this.location, boundaryData);
    }
    
    /** @inheritdoc */
    regenerateBoundary() {
        if (!this.location || this.location.boundaryData) {
            return;
        }

        const boundaryData = this.location;
        this.minX = boundaryData.minX;
        this.maxX = boundaryData.maxX;
        this.minY = boundaryData.minY;
        this.maxY = boundaryData.maxY;
    }

    /**
     * Get the rectangular boundary in the form of [x, y, width, height] where the
     * coordinate indicates the upper left
     * point of the rectangular boundary in browser space
     *
     * @return {void}
     */
    getBrowserRectangularBoundary() {}

    /**
     * Clear any drawn boundary and associated dialog
     *
     * @return {void}
     */
    clearBoundary() {
        const boundaryEl = this.annotatedElement.querySelector('.ba-drawing-boundary');
        if (boundaryEl) {
            boundaryEl.parentNode.removeChild(boundaryEl);
        }
    }

    /**
     * Create an annotation data object to pass to annotation service.
     *
     * @param {string} type - Type of annotation
     * @param {string} message - Annotation text
     * @return {Object} Annotation data
     */
    createAnnotationData(type, message) {
        return {
            item: {
                id: this.fileVersionId,
                type: 'file_version'
            },
            details: {
                type,
                location: this.location,
                threadID: this.threadID,
                drawingPaths: this.pathContainer
            },
            createdBy: this.api.user,
            thread: this.threadNumber
        };
    }

    /** @inheritdoc */
    cleanupAnnotationOnDelete() {
        this.destroy();
        this.threadID = null;
    }
}

export default DrawingThread;
