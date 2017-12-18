import AnnotationThread from '../AnnotationThread';
import DocHighlightDialog from './DocHighlightDialog';
import * as util from '../util';
import * as docUtil from './docUtil';
import {
    THREAD_EVENT,
    STATES,
    TYPES,
    SELECTOR_ADD_HIGHLIGHT_BTN,
    HIGHLIGHT_FILL,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT_COMMENT,
    PAGE_PADDING_TOP,
    PAGE_PADDING_BOTTOM
} from '../constants';

const HOVER_TIMEOUT_MS = 75;

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
     * @param {boolean} showComment Whether or not show comment highlight UI
     * @return {AnnotationDialog} Annotation dialog instance
     */
    constructor(data, showComment) {
        super(data);

        this.showComment = showComment;
    }

    /**
     * Cancels the first comment on the thread
     *
     * @return {void}
     */
    cancelFirstComment() {
        if (util.isPlainHighlight(this.annotations)) {
            if (this.isMobile) {
                this.dialog.hideCommentsDialog();
                this.state = STATES.inactive;
            } else {
                this.dialog.toggleHighlightDialogs();
                this.reset();
            }

            // Reset type from highlight-comment to highlight
            this.type = TYPES.highlight;
        } else if (!this.isMobile) {
            this.destroy();
        } else {
            this.reset();
        }
    }

    /**
     * [destructor]
     *
     * @override
     * @return {void}
     */
    destroy() {
        super.destroy();

        if (this.state === STATES.pending) {
            window.getSelection().removeAllRanges();
        }
        this.emit(THREAD_EVENT.threadCleanup);
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
        this.show();
    }

    /**
     * Saves an annotation.
     *
     * @override
     * @param {string} type Type of annotation
     * @param {string} text Text of annotation to save
     * @return {void}
     */
    saveAnnotation(type, text) {
        super.saveAnnotation(type, text);
        window.getSelection().removeAllRanges();
    }

    /**
     * Deletes an annotation.
     *
     * @param {string} annotationID ID of annotation to delete
     * @param {boolean} [useServer] Whether or not to delete on server, default true
     * @return {void}
     */
    deleteAnnotation(annotationID, useServer = true) {
        super.deleteAnnotation(annotationID, useServer);

        // Hide delete button on plain highlights if user doesn't have
        // permissions
        const firstAnnotation = util.getFirstAnnotation(this.annotations);
        if (!firstAnnotation) {
            return;
        }

        const hasComments = firstAnnotation.text !== '' || Object.keys(this.annotations).length > 1;
        if (hasComments && firstAnnotation.permissions && !firstAnnotation.permissions.can_delete) {
            const addHighlightBtn = this.dialog.element.querySelector(SELECTOR_ADD_HIGHLIGHT_BTN);
            util.hideElement(addHighlightBtn);
        }
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
        // If state is in hover, it means mouse is already over this highlight
        // so we can skip the is in highlight calculation
        if (!consumed && this.isOnHighlight(event)) {
            this.state = STATES.hover;
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
        return util.isInDialog(event, this.dialog.element) || this.isInHighlight(event);
    }

    /**
     * Sets thread state to hover or active-hover accordingly and triggers
     * dialog to remain open
     *
     * @return {void}
     */
    activateDialog() {
        this.state = STATES.hover;

        // Setup the dialog element if it has not already been created
        if (!this.dialog.element) {
            this.dialog.setup(this.annotations, this.showComment);
        }
        this.dialog.mouseenterHandler();
        clearTimeout(this.hoverTimeoutHandler);
    }

    /**
     * Mousemove handler for thread. If mouse is inside this highlight, set
     * state to be hover and return true. If not, set state to be inactive,
     * and reset. We don't draw hovered highlights in this method since we want
     * to delay that drawing until all inactive threads have been reset.
     *
     * @param {Event} event Mouse event
     * @return {boolean} Whether we should delay drawing highlight
     */
    onMousemove(event) {
        // If mouse is in dialog, change state to hover or active-hover
        if (util.isInDialog(event, this.dialog.element)) {
            // Keeps dialog open if comment is pending
            if (this.state === STATES.pending_active) {
                return false;
            }
            this.state = STATES.hover;

            // If mouse is in highlight, change state to hover or active-hover
        } else if (this.isInHighlight(event)) {
            this.activateDialog();

            // No-op
            // If mouse is not in highlight and state is not already inactive, reset
        } else if (this.state !== STATES.inactive) {
            // Add timeout before resettting highlight to inactive so
            // hovering over line breaks doesn't cause flickering
            this.hoverTimeoutHandler = setTimeout(() => {
                this.reset();
            }, HOVER_TIMEOUT_MS);

            return false;

            // If state is already inactive, don't delay or reset
        } else {
            return false;
        }
        return true;
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
                this.showDialog();
                break;
            case STATES.inactive:
                this.hideDialog();
                this.draw(HIGHLIGHT_FILL.normal);
                break;
            case STATES.hover:
            case STATES.pending_active:
                this.showDialog();
                this.draw(HIGHLIGHT_FILL.active);
                break;
            default:
                break;
        }
    }

    /** Overridden to hide UI elements depending on whether or not comments or plain
     * are allowed. Note: This will be deprecated upon proper refactor or comment highlight
     * and plain highlights.
     *
     * @override
     * @return {void}
     */
    showDialog() {
        // Prevents the annotations dialog from being created each mousemove
        if (!this.dialog.element) {
            this.dialog.setup(this.annotations, this.showComment);
        }

        this.dialog.show();
    }

    /**
     * Creates the document highlight annotation dialog for the thread.
     *
     * @override
     * @return {void}
     */
    createDialog() {
        this.dialog = new DocHighlightDialog({
            annotatedElement: this.annotatedElement,
            container: this.container,
            annotations: this.annotations,
            locale: this.locale,
            location: this.location,
            canAnnotate: this.permissions.canAnnotate
        });

        // Ensures that previously created annotations have the right type
        const firstAnnotation = util.getFirstAnnotation(this.annotations);
        if (!firstAnnotation) {
            return;
        }

        const hasComments = firstAnnotation.text !== '' || Object.keys(this.annotations).length > 1;
        if (hasComments && this.type === TYPES.highlight) {
            this.type = TYPES.highlight_comment;
        }
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
        this.state = STATES.pending_active;
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
        this.state = STATES.pending_active;
    }

    /**
     * Create the appropriate type of highlight annotation thread on
     * 'annotationcreate'
     *
     * @private
     * @param {Object} data Event data
     * @return {void}
     */
    handleCreate(data) {
        if (data) {
            this.type = TYPES.highlight_comment;
            this.dialog.toggleHighlightCommentsReply(Object.keys(this.annotations).length);
        } else {
            this.type = TYPES.highlight;
        }

        this.saveAnnotation(this.type, data ? data.text : '');
    }

    /**
     * Delete the annotation annotation or the thread's first annotation based on
     * if an annotationID is specified on 'annotationdelete'
     *
     * @private
     * @param {Object} data Event data
     * @return {void}
     */
    handleDelete(data) {
        if (data) {
            this.deleteAnnotation(data.annotationID);
            return;
        }

        const firstAnnotation = util.getFirstAnnotation(this.annotations);
        if (firstAnnotation) {
            this.deleteAnnotation(firstAnnotation.annotationID);
        }
    }

    /**
     * Binds custom event listeners for the dialog.
     *
     * @protected
     * @override
     * @return {void}
     */
    /* istanbul ignore next */
    bindCustomListenersOnDialog() {
        // Explicitly bind listeners
        this.handleDraw = this.handleDraw.bind(this);
        this.handleCommentPending = this.handleCommentPending.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.cancelFirstComment = this.cancelFirstComment.bind(this);

        this.dialog.addListener('annotationdraw', this.handleDraw);
        this.dialog.addListener('annotationcommentpending', this.handleCommentPending);
        this.dialog.addListener('annotationcreate', this.handleCreate);
        this.dialog.addListener('annotationcancel', this.cancelFirstComment);
        this.dialog.addListener('annotationdelete', this.handleDelete);
    }

    /**
     * Unbinds custom event listeners for the dialog.
     *
     * @protected
     * @override
     * @return {void}
     */
    unbindCustomListenersOnDialog() {
        this.dialog.removeAllListeners('annotationdraw');
        this.dialog.removeAllListeners('annotationcommentpending');
        this.dialog.removeAllListeners('annotationcreate');
        this.dialog.removeAllListeners('annotationcancel');
        this.dialog.removeAllListeners('annotationdelete');
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

                // Update highlight icon hover to appropriate color
                if (this.dialog.element) {
                    this.dialog.toggleHighlightIcon(fillStyle);
                }
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
            this.pageEl = docUtil.getPageEl(this.annotatedElement, this.location.page);
        }
        return this.pageEl;
    }

    setThreadBoundary() {
        if (!this.location || !this.location.quadPoints) {
            return;
        }

        this.minX = Infinity;
        this.minY = Infinity;
        this.maxX = 0;
        this.maxY = 0;

        this.location.quadPoints.forEach((quadPoint) => {
            const [x1, y1, x2, y2, x3, y3, x4, y4] = quadPoint;

            if (Math.min(x1, x2, x3, x4) < this.minX) {
                this.minX = Math.min(x1, x2, x3, x4);
            }

            if (Math.max(x1, x2, x3, x4) > this.maxX) {
                this.maxX = Math.max(x1, x2, x3, x4);
            }

            if (Math.min(y1, y2, y3, y4) < this.minY) {
                this.minY = Math.min(y1, y2, y3, y4);
            }

            if (Math.max(y1, y2, y3, y4) > this.maxY) {
                this.maxY = Math.max(y1, y2, y3, y4);
            }
        });
    }
}

export default DocHighlightThread;
