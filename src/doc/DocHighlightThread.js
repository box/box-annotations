import AnnotationThread from '../AnnotationThread';
import * as util from '../util';
import * as docUtil from './docUtil';
import {
    THREAD_EVENT,
    STATES,
    TYPES,
    HIGHLIGHT_FILL,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT_COMMENT,
    PAGE_PADDING_TOP,
    PAGE_PADDING_BOTTOM,
    BORDER_OFFSET,
    INLINE_POPOVER_HEIGHT,
    SELECTOR_CLASS_ANNOTATION_POPOVER
} from '../constants';

class DocHighlightThread extends AnnotationThread {
    /**
     * Cached page element for the document.
     *
     * @property {HTMLElement}
     */
    pageEl;

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * [constructor]
     *
     * @param {AnnotationDialogData} data Data for constructing thread
     * @param {boolean} canComment Whether or not show comment highlight UI
     * @return {AnnotationDialog} Annotation dialog instance
     */
    constructor(data, canComment) {
        super(data);

        this.canComment = canComment;
    }

    /**
     * Cancels the first comment on the thread
     *
     * @return {void}
     */
    cancelFirstComment() {
        // Reset type from highlight-comment to highlight
        if (util.isPlainHighlight(this.comments)) {
            this.type = TYPES.highlight;
        }

        this.reset();

        // Clear and reset mobile annotations dialog
        if (util.shouldDisplayMobileUI(this.container)) {
            this.unmountPopover();
        } else if (util.isPlainHighlight(this.comments)) {
            this.renderAnnotationPopover();
        } else {
            this.destroy();
        }
    }

    /**
     * [destructor]
     *
     * @override
     * @return {void}
     */
    destroy() {
        this.emit(THREAD_EVENT.render, this.location.page);
        super.destroy();

        if (this.state === STATES.pending) {
            window.getSelection().removeAllRanges();
        }
    }

    /**
     * Hides the highlight by cutting out the annotation from context. Note
     * that if there are any overlapping highlights, this will cut out
     * the overlapping portion.
     *
     * @override
     * @return {void}
     */
    hide() {
        this.draw(HIGHLIGHT_FILL.erase);
    }

    /**
     * Reset state to inactive and redraw.
     *
     * @override
     * @return {void}
     */
    reset() {
        this.state = STATES.inactive;
        this.draw(HIGHLIGHT_FILL.normal);
    }

    /**
     * Saves an annotation.
     *
     * @override
     * @param {string} type Type of annotation
     * @param {string} text Text of annotation to save
     * @return {void}
     */
    save(type, text) {
        super.save(type, text);
        window.getSelection().removeAllRanges();
    }

    /**
     * Deletes an annotation.
     *
     * @param {Object} annotation annotation to delete
     * @param {boolean} [useServer] Whether or not to delete on server, default true
     * @return {void}
     */
    delete(annotation, useServer = true) {
        super.delete(annotation, useServer);

        if (!this.threadID) {
            return;
        }

        this.renderAnnotationPopover();
    }

    /**
     * Mousedown handler for thread. Deletes this thread if it is still pending.
     *
     * @return {void}
     */
    onMousedown() {
        // Destroy pending highlights on mousedown
        if (this.state === STATES.pending) {
            this.destroy();
        }
    }

    /**
     * Click handler for thread. If click is inside this highlight, set the
     * state to be active, and return true. If not, hide the delete highlight
     * button, set state to inactive, and reset. The 'consumed' param tracks
     * whether or not some other click handler activated a highlight. If
     * not, normal behavior occurs. If true, don't set the highlight to active
     * when normally it should be activated. We don't draw active highlights
     * in this method since we want to delay that drawing until all inactive
     * threads have been reset.
     *
     * @param {Event} event Mouse event
     * @param {boolean} consumed Whether event previously activated another
     * highlight
     * @return {boolean} Whether click was in a non-pending highlight
     */
    onClick(event, consumed) {
        // If state is in active, it means mouse is already over this highlight
        // so we can skip the is in highlight calculation
        if (!consumed && this.isOnHighlight(event)) {
            this.state = STATES.active;
            this.show();
            return true;
        }

        // If this highlight was previously active and we clicked out of it or
        // a previous event already activated a highlight, reset
        this.reset();
        return false;
    }

    /**
     * Checks if Mouse event is either over the text highlight or the annotations
     * dialog
     *
     * @param  {Event} event Mouse event
     * @return {boolean} Whether or not Mouse event is in highlight or over
     * the annotations dialog
     */
    isOnHighlight(event) {
        return util.isInDialog(event) || this.isInHighlight(event);
    }

    //--------------------------------------------------------------------------
    // Abstract Implementations
    //--------------------------------------------------------------------------

    /**
     * Shows the highlight thread, which means different things based on the
     * state of the thread. If the thread is pending, we show the 'add' button.
     * If it is inactive, we draw the highlight. If it is active, we draw
     * the highlight in active state and show the 'delete' button.
     *
     * @override
     * @return {void}
     */
    show() {
        switch (this.state) {
            case STATES.pending:
                this.renderAnnotationPopover();
                break;
            case STATES.inactive:
                this.unmountPopover();
                this.draw(HIGHLIGHT_FILL.normal);
                break;
            case STATES.active:
                this.renderAnnotationPopover();
                this.draw(HIGHLIGHT_FILL.active);
                break;
            default:
                break;
        }

        super.show();
    }

    //--------------------------------------------------------------------------
    // Protected
    //--------------------------------------------------------------------------

    /**
     * No-op setup element. Highlight threads have no HTML indicator since
     * they are drawn onto the canvas.
     *
     * @protected
     * @override
     * @return {void}
     */
    setupElement() {}

    /**
     * Clear text selection and show annotation dialog on 'annotationdraw'
     *
     * @private
     * @return {void}
     */
    handleDraw() {
        this.state = STATES.pending;
        window.getSelection().removeAllRanges();
        this.show();
    }

    /**
     * Set the thread state to pending active on 'annotationcommentpending'
     *
     * @private
     * @return {void}
     */
    handleCommentPending() {
        this.state = STATES.pending;
    }

    /**
     * Create the appropriate type of highlight annotation thread on
     * 'annotationcreate'
     *
     * @private
     * @param {string} message Annotation message string
     * @return {void}
     */
    handleCreate(message) {
        if (message) {
            this.type = TYPES.highlight_comment;
            this.renderAnnotationPopover();
        } else {
            this.type = TYPES.highlight;
        }

        this.save(this.type, message || '');
    }

    /**
     * Delete the annotation annotation or the thread's first annotation based on
     * if an id is specified on 'annotationdelete'
     *
     * @private
     * @param {Object} data Event data
     * @return {void}
     */
    handleDelete(data) {
        if (data) {
            this.delete(data);
            return;
        }

        if (this.comments.length <= 0) {
            this.delete({ id: this.id });
        }
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Scroll annotation into the center of the viewport, if possible
     *
     * @private
     * @return {void}
     */
    scrollIntoView() {
        this.scrollToPage();

        const [yPos] = docUtil.getLowerRightCornerOfLastQuadPoint(this.location.quadPoints);

        // Adjust scroll to highlight position
        this.adjustScroll(this.annotatedElement.scrollTop + yPos);
    }

    /**
     * Draws the highlight with the specified fill style.
     *
     * @private
     * @param {string} fillStyle RGBA fill style
     * @return {void}
     */
    /* istanbul ignore next */
    draw(fillStyle) {
        const pageEl = this.getPageEl();
        const context =
            this.type === TYPES.highlight
                ? docUtil.getContext(pageEl, CLASS_ANNOTATION_LAYER_HIGHLIGHT)
                : docUtil.getContext(pageEl, CLASS_ANNOTATION_LAYER_HIGHLIGHT_COMMENT);
        if (!context) {
            return;
        }

        const pageDimensions = pageEl.getBoundingClientRect();
        const pageHeight = pageDimensions.height - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;
        const zoomScale = util.getScale(this.annotatedElement);
        const dimensionScale = util.getDimensionScale(
            this.location.dimensions,
            pageDimensions,
            zoomScale,
            PAGE_PADDING_TOP + PAGE_PADDING_BOTTOM
        );

        this.location.quadPoints.forEach((quadPoint) => {
            // If needed, scale quad points comparing current dimensions with saved dimensions
            let scaledQuadPoint = quadPoint;
            if (dimensionScale) {
                scaledQuadPoint = quadPoint.map((val, index) => {
                    return index % 2 ? val * dimensionScale.y : val * dimensionScale.x;
                });
            }

            const browserQuadPoint = docUtil.convertPDFSpaceToDOMSpace(scaledQuadPoint, pageHeight, zoomScale);
            const [x1, y1, x2, y2, x3, y3, x4, y4] = browserQuadPoint;

            context.fillStyle = fillStyle;
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.lineTo(x3, y3);
            context.lineTo(x4, y4);
            context.closePath();

            // We 'cut out'/erase the highlight rectangle before drawing
            // the actual highlight rectangle to prevent overlapping
            // transparency
            context.save();
            context.globalCompositeOperation = 'destination-out';
            context.fillStyle = HIGHLIGHT_FILL.erase;
            context.fill();
            context.restore();

            // Draw actual highlight rectangle if needed
            if (fillStyle !== HIGHLIGHT_FILL.erase) {
                context.fill();
            }
        });
    }
    /* eslint-enable space-before-function-paren */

    /**
     * Checks whether mouse is inside the highlight represented by this thread.
     *
     * @private
     * @param {Event} event Mouse event
     * @return {boolean} Whether or not mouse is inside highlight
     */
    isInHighlight(event) {
        const pageEl = this.getPageEl();
        const pageDimensions = pageEl.getBoundingClientRect();
        const pageHeight = pageDimensions.height - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;
        const pageTop = pageDimensions.top + PAGE_PADDING_TOP;
        const zoomScale = util.getScale(this.annotatedElement);
        const dimensionScale = util.getDimensionScale(
            this.location.dimensions,
            pageDimensions,
            zoomScale,
            PAGE_PADDING_TOP + PAGE_PADDING_BOTTOM
        );

        /**
         * Scale verticies according to dimension scale.
         *
         * @param {number} val Value to scale
         * @param {number} index Vertex index
         * @return {number} Scaled value
         */
        const scaleVertices = (val, index) => {
            return index % 2 ? val * dimensionScale.y : val * dimensionScale.x;
        };

        // DOM coordinates with respect to the page
        const x = event.clientX - pageDimensions.left;
        const y = event.clientY - pageTop;

        let eventOccurredInHighlight = false;

        const points = this.location.quadPoints;
        const { length } = points;

        let index = 0;
        while (index < length && !eventOccurredInHighlight) {
            const quadPoint = points[index];
            // If needed, scale quad points comparing current dimensions with saved dimensions
            const scaledQuadPoint = [...quadPoint];
            if (dimensionScale) {
                const qLength = quadPoint.length;
                for (let i = 0; i < qLength; i++) {
                    scaledQuadPoint[i] = scaleVertices(quadPoint[i], i);
                }
            }

            const browserQuadPoint = docUtil.convertPDFSpaceToDOMSpace(scaledQuadPoint, pageHeight, zoomScale);

            const [x1, y1, x2, y2, x3, y3, x4, y4] = browserQuadPoint;

            eventOccurredInHighlight = docUtil.isPointInPolyOpt([[x1, y1], [x2, y2], [x3, y3], [x4, y4]], x, y);

            index += 1;
        }

        return eventOccurredInHighlight;
    }

    /**
     * Gets the page element this thread is on.
     *
     * @private
     * @return {HTMLElement} Page element
     */
    getPageEl() {
        if (!this.pageEl) {
            this.pageEl = util.getPageEl(this.annotatedElement, this.location.page);
        }
        return this.pageEl;
    }

    /**
     * Regenerate the coordinates of the rectangular boundary on the saved thread for inserting into the rtree
     *
     * @inheritdoc
     * @private
     * @return {void}
     */
    regenerateBoundary() {
        if (!this.location || !this.location.quadPoints) {
            return;
        }

        this.minX = Infinity;
        this.minY = Infinity;
        this.maxX = 0;
        this.maxY = 0;

        this.location.quadPoints.forEach((quadPoint) => {
            const [x1, y1, x2, y2, x3, y3, x4, y4] = quadPoint;
            this.minX = Math.min(x1, x2, x3, x4, this.minX);
            this.maxX = Math.max(x1, x2, x3, x4, this.maxX);
            this.minY = Math.min(y1, y2, y3, y4, this.minY);
            this.maxY = Math.max(y1, y2, y3, y4, this.maxY);
        });
    }

    /**
     * Positions the dialog.
     *
     * @override
     * @return {void}
     */
    position = () => {
        if (util.shouldDisplayMobileUI(this.container)) {
            return;
        }

        // Position it below lower right corner or center of the highlight - we need
        // to reposition every time since the DOM could have changed from
        // zooming
        const pageEl = this.getPopoverParent();
        const pageDimensions = pageEl.getBoundingClientRect();
        const pageHeight = pageDimensions.height - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;
        const [browserX, browserY] = docUtil.getScaledPDFCoordinates(
            this.annotatedElement,
            this.location,
            pageDimensions,
            pageHeight
        );

        const popoverEl = util.findElement(
            this.annotatedElement,
            SELECTOR_CLASS_ANNOTATION_POPOVER,
            this.renderAnnotationPopover
        );
        const dialogDimensions = popoverEl.getBoundingClientRect();
        const dialogWidth = dialogDimensions.width;
        let dialogX = browserX - dialogWidth / 2; // Center dialog
        let dialogY = browserY;

        // Only reposition if one side is past page boundary - if both are,
        // just center the dialog and cause scrolling since there is nothing
        // else we can do
        dialogX = util.repositionCaret(popoverEl, dialogX, dialogWidth, browserX, pageDimensions.width);

        if (dialogY < 0) {
            dialogY = 0;
        } else if (dialogY + INLINE_POPOVER_HEIGHT > pageHeight) {
            dialogY = pageHeight - INLINE_POPOVER_HEIGHT;
        }

        popoverEl.style.left = `${dialogX}px`;
        popoverEl.style.top = `${dialogY + INLINE_POPOVER_HEIGHT / 2 - BORDER_OFFSET}px`;
    };

    /**
     * Keydown handler on dialog. Needed since we are binding to 'mousedown'
     * instead of 'click'.
     *
     * @override
     * @private
     * @return {void}
     */
    keydownHandler(event) {
        event.stopPropagation();
        if (util.decodeKeydown(event) === 'Enter') {
            this.mousedownHandler(event);
        }
        super.keydownHandler(event);
    }
}

export default DocHighlightThread;
