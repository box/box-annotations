import DrawingPath from '../drawing/DrawingPath';
import DrawingThread from '../drawing/DrawingThread';
import {
    STATES,
    DRAW_STATES,
    CLASS_ANNOTATION_LAYER_DRAW,
    CLASS_ANNOTATION_LAYER_DRAW_IN_PROGRESS,
    PAGE_PADDING_TOP
} from '../constants';
import { getBrowserCoordinatesFromLocation, getContext } from './docUtil';
import { createLocation, getScale, repositionCaret, findElement, getPageEl, shouldDisplayMobileUI } from '../util';

class DocDrawingThread extends DrawingThread {
    /** @property {HTMLElement} - Page element being observed */
    pageEl;

    /** @property {boolean} - Whether or not to wait until next frame to create another point in the drawing */
    isBuffering = false;

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------
    /**
     * [constructor]
     *
     * @inheritdoc
     * @param {AnnotationThreadData} data - Data for constructing thread
     * @return {DocDrawingThread} Drawing annotation thread instance
     */
    constructor(data) {
        super(data);

        this.onPageChange = this.onPageChange.bind(this);
        this.reconstructBrowserCoordFromLocation = this.reconstructBrowserCoordFromLocation.bind(this);
    }

    /**
     * Toggles current buffering state.
     *
     * @return {void}
     */
    toggleBufferingState = () => {
        this.isBuffering = !this.isBuffering;
    };

    /**
     * Handle a pointer movement
     *
     * @public
     * @param {Object} location - The location information of the pointer
     * @return {void}
     */
    handleMove(location) {
        if (this.drawingFlag !== DRAW_STATES.drawing || !location) {
            return;
        }

        if (this.hasPageChanged(location)) {
            this.onPageChange(location);
            return;
        }

        // If the current path is being buffered, don't create redundant points
        if (!this.isBuffering && this.pendingPath) {
            const [x, y] = getBrowserCoordinatesFromLocation(location, this.pageEl);
            const browserLocation = createLocation(x, y);
            this.pendingPath.addCoordinate(location, browserLocation);

            // On next browser frame, reset to allow for another point to be added to the path
            this.toggleBufferingState();
            window.requestAnimationFrame(this.toggleBufferingState);
        }
    }

    /**
     * Start a drawing stroke
     *
     * @public
     * @param {Object} location - The location information of the pointer
     * @return {void}
     */
    handleStart(location) {
        if (!location) {
            return;
        }

        this.unmountPopover();

        const pageChanged = this.hasPageChanged(location);
        if (pageChanged) {
            this.onPageChange(location);
            return;
        }

        // Assign a location and dimension to the annotation thread
        if ((!this.location || !this.location.page) && location.page) {
            this.location = {
                page: location.page,
                dimensions: location.dimensions
            };
        }
        this.checkAndHandleScaleUpdate();

        this.drawingFlag = DRAW_STATES.drawing;
        if (!this.pendingPath) {
            this.pendingPath = new DrawingPath();
        }

        this.unmountPopover();

        // Start drawing rendering
        this.lastAnimationRequestId = window.requestAnimationFrame(this.render);
        this.state = STATES.pending;
    }

    /**
     * End a drawing stroke
     *
     * @public
     * @return {void}
     */
    handleStop() {
        // Stop the render loop and finish drawing
        window.cancelAnimationFrame(this.lastAnimationRequestId);
        this.lastAnimationRequestId = 0;

        this.drawingFlag = DRAW_STATES.idle;

        if (!this.pendingPath || this.pendingPath.isEmpty()) {
            return;
        }

        this.pathContainer.insert(this.pendingPath);
        this.updateBoundary(this.pendingPath);
        this.regenerateBoundary();

        if (this.pathContainer.isEmpty()) {
            this.unmountPopover();
        }

        this.render();
        this.renderAnnotationPopover();
        this.emitAvailableActions();
        this.pendingPath = null;
        this.state = STATES.pending;
    }

    /**
     * Determine if the drawing in progress if a drawing goes to a different page
     *
     * @public
     * @param {Object} location - The current event location information
     * @return {boolean} Whether or not the thread page has changed
     */
    hasPageChanged(location) {
        return !!(location && !!this.location && !!this.location.page && this.location.page !== location.page);
    }

    /**
     * Display the document drawing thread. Will set the drawing context if the scale has changed since the last show.
     *
     * @public
     * @return {void}
     */
    show() {
        if (!this.annotatedElement || !this.location) {
            return;
        }

        // Get the annotation layer context to draw with
        const context = this.selectContext();

        // Generate the paths and draw to the annotation layer canvas
        this.pathContainer.applyToItems((drawing) =>
            drawing.generateBrowserPath(this.reconstructBrowserCoordFromLocation)
        );

        if (this.pendingPath && !this.pendingPath.isEmpty()) {
            this.pendingPath.generateBrowserPath(this.reconstructBrowserCoordFromLocation);
        }

        this.draw(context, false);
    }

    hide() {
        this.clearBoundary();
        this.unmountPopover();
    }

    /**
     * Prepare the pending drawing canvas if the scale factor has changed since the last render. Will do nothing if
     * the thread has not been assigned a page.
     *
     * @private
     * @return {void}
     */
    checkAndHandleScaleUpdate() {
        const scale = getScale(this.annotatedElement);
        if (this.lastScaleFactor === scale || (!this.location || !this.location.page)) {
            return;
        }

        // Set the scale and in-memory context for the pending thread
        this.lastScaleFactor = scale;
        this.pageEl = getPageEl(this.annotatedElement, this.location.page);
        this.drawingContext = getContext(this.pageEl, CLASS_ANNOTATION_LAYER_DRAW_IN_PROGRESS);

        const config = { scale };
        this.setContextStyles(config);
    }

    /**
     * End the current drawing and emit a page changed event
     *
     * @private
     * @param {Object} location - The location information indicating the page has changed.
     * @return {void}
     */
    onPageChange(location) {
        this.handleStop();
        this.emit('softcommit', { location });
    }

    /**
     * Requires a DocDrawingThread to have been started with DocDrawingThread.start(). Reconstructs a browserCoordinate
     * relative to the dimensions of the DocDrawingThread page element.
     *
     * @private
     * @param {Location} documentLocation - The location coordinate relative to the document
     * @return {Location} The location coordinate relative to the browser
     */
    reconstructBrowserCoordFromLocation(documentLocation) {
        const reconstructedLocation = createLocation(documentLocation.x, documentLocation.y, this.location.dimensions);
        const [xNew, yNew] = getBrowserCoordinatesFromLocation(reconstructedLocation, this.pageEl);
        return createLocation(xNew, yNew);
    }

    /**
     * Choose the context to draw on. If the state of the thread is pending, select the in-progress context,
     * otherwise select the concrete context.
     *
     * @private
     * @return {void}
     */
    selectContext() {
        this.checkAndHandleScaleUpdate();

        if (this.state === STATES.pending) {
            return this.drawingContext;
        }

        const config = { scale: this.lastScaleFactor };
        this.concreteContext = getContext(this.pageEl, CLASS_ANNOTATION_LAYER_DRAW);

        this.setContextStyles(config, this.concreteContext);

        return this.concreteContext;
    }

    /**
     * Retrieve the rectangle upper left coordinate along with its width and height
     *
     * @private
     * @return {Array|null} The an array of length 4 with the first item being the x coordinate, the second item
     *                      being the y coordinate, and the 3rd/4th items respectively being the width and height
     */
    getBrowserRectangularBoundary() {
        if (!this.location || !this.location.dimensions || !this.pageEl) {
            return null;
        }

        const l1 = createLocation(this.minX, this.minY, this.location.dimensions);
        const l2 = createLocation(this.maxX, this.maxY, this.location.dimensions);
        const [x1, y1] = getBrowserCoordinatesFromLocation(l1, this.pageEl);
        const [x2, y2] = getBrowserCoordinatesFromLocation(l2, this.pageEl);
        const width = x2 - x1;
        const height = y2 - y1;

        return [x1, y1, width, height];
    }

    /**
     * Retrieve the lower right corner of the drawing annotation
     *
     * @private
     * @return {Array|null} An array of length 2 with the first item being the x coordinate, the second item
     *                      being the y coordinate
     */
    getLowerRightCornerOfBoundary() {
        if (!this.location || !this.location.dimensions || !this.pageEl) {
            return null;
        }

        const l1 = createLocation(this.minX, this.minY, this.location.dimensions);
        const l2 = createLocation(this.maxX, this.maxY, this.location.dimensions);
        const [x1, y1] = getBrowserCoordinatesFromLocation(l1, this.pageEl);
        const [x2, y2] = getBrowserCoordinatesFromLocation(l2, this.pageEl);

        return [Math.max(x1, x2), Math.max(y1, y2)];
    }

    /**
     * Draw the boundary on a drawing thread that has been saved
     *
     * @protected
     * @return {void}
     */
    drawBoundary = () => {
        super.drawBoundary();

        if (!this.location.page) {
            return;
        }

        const boundaryEl = document.createElement('div');
        boundaryEl.classList.add('ba-drawing-boundary');

        const l1 = createLocation(this.minX, this.minY, this.location.dimensions);
        const l2 = createLocation(this.maxX, this.maxY, this.location.dimensions);
        const [x1, y1] = getBrowserCoordinatesFromLocation(l1, this.pageEl);
        const [x2, y2] = getBrowserCoordinatesFromLocation(l2, this.pageEl);

        const BOUNDARY_PADDING = 10;
        boundaryEl.style.left = `${Math.min(x1, x2) - BOUNDARY_PADDING}px`;
        boundaryEl.style.top = `${Math.min(y1, y2) + BOUNDARY_PADDING / 2}px`;
        boundaryEl.style.width = Math.abs(x2 - x1) + 2 * BOUNDARY_PADDING;
        boundaryEl.style.height = Math.abs(y2 - y1) + 2 * BOUNDARY_PADDING;

        const pageEl = getPageEl(this.annotatedElement, this.location.page);
        pageEl.appendChild(boundaryEl);
    };

    /**
     * Position the drawing dialog with an x,y browser coordinate
     *
     * @protected
     * @return {void}
     */
    position = () => {
        if (shouldDisplayMobileUI(this.container)) {
            return;
        }

        if (!this.pageEl) {
            this.pageEl = this.getPopoverParent();
        }

        // Render popover so we can get width
        const popoverEl = findElement(this.annotatedElement, '.ba-popover', this.renderAnnotationPopover);
        const boundaryEl = findElement(this.annotatedElement, '.ba-drawing-boundary', this.drawBoundary);
        const pageDimensions = this.pageEl.getBoundingClientRect();
        const boundaryDimensions = boundaryEl.getBoundingClientRect();
        const popoverDimensions = popoverEl.getBoundingClientRect();

        const popoverWidth = popoverDimensions.width;
        const popoverY = boundaryEl.offsetTop + boundaryDimensions.height + PAGE_PADDING_TOP;
        let popoverX = boundaryEl.offsetLeft + boundaryDimensions.width / 2 - popoverWidth / 2;
        popoverX = repositionCaret(popoverEl, popoverX, popoverWidth, popoverX, pageDimensions.width);

        popoverEl.style.left = `${popoverX}px`;
        popoverEl.style.top = `${popoverY}px`;
    };
}

export default DocDrawingThread;
