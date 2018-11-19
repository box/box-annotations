// @flow
import rangy from 'rangy';
/* eslint-disable no-unused-vars */
// Workaround for rangy npm issue: https://github.com/timdown/rangy/lib/issues/342
import rangyClassApplier from 'rangy/lib/rangy-classapplier';
import rangyHighlight from 'rangy/lib/rangy-highlighter';
import rangySaveRestore from 'rangy/lib/rangy-selectionsaverestore';
/* eslint-enable no-unused-vars */
import Annotator from '../Annotator';
import AnnotationAPI from '../api/AnnotationAPI';
import CreateHighlightDialog from './CreateHighlightDialog';
import * as util from '../util';
import * as docUtil from './docUtil';
import {
    STATES,
    TYPES,
    PAGE_PADDING_TOP,
    PAGE_PADDING_BOTTOM,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT_COMMENT,
    CLASS_ANNOTATION_LAYER_DRAW,
    THREAD_EVENT,
    ANNOTATOR_EVENT,
    CONTROLLER_EVENT,
    CREATE_EVENT,
    CLASS_ANNOTATION_POPOVER
} from '../constants';

const SELECTION_TIMEOUT = 500;
const CLASS_RANGY_HIGHLIGHT = 'rangy-highlight';

const SELECTOR_PREVIEW_DOC = '.bp-doc';
const CLASS_DEFAULT_CURSOR = 'bp-use-default-cursor';

// Required by rangy highlighter
const ID_ANNOTATED_ELEMENT = 'ba-rangy-annotated-element';

const ANNOTATION_LAYER_CLASSES = [
    CLASS_ANNOTATION_LAYER_HIGHLIGHT,
    CLASS_ANNOTATION_LAYER_HIGHLIGHT_COMMENT,
    CLASS_ANNOTATION_LAYER_DRAW
];

class DocAnnotator extends Annotator {
    /** @property {CreateHighlightDialog} - UI used to create new highlight annotations. */
    createHighlightDialog: ?CreateHighlightDialog;

    /** @property {Event} - For delaying creation of highlight quad points and dialog. Tracks the
     * current selection event, made in a previous event. */
    lastHighlightEvent: ?Event;

    /** @property {Selection} - For tracking diffs in text selection, for mobile highlights creation. */
    lastSelection: ?Selection;

    /** @property {boolean} - True if regular highlights are allowed to be read/written */
    plainHighlightEnabled: boolean;

    /** @property {boolean} - True if draw annotations are allowed to be read/written */
    drawEnabled: boolean;

    /** @property {boolean} - True if comment highlights are allowed to be read/written */
    commentHighlightEnabled: boolean;

    /** @property {Function} - Reference to filter function that has been bound TODO(@jholdstock): remove on refactor. */
    showFirstDialogFilter: Function;

    /** @inheritdoc */
    constructor(options: Object) {
        super(options);

        // $FlowFixMe
        this.highlightCurrentSelection = this.highlightCurrentSelection.bind(this);
        // $FlowFixMe
        this.createHighlightThread = this.createHighlightThread.bind(this);
        // $FlowFixMe
        this.createPlainHighlight = this.createPlainHighlight.bind(this);
        // $FlowFixMe
        this.onSelectionChange = this.onSelectionChange.bind(this);
        // $FlowFixMe
        this.resetAnnotationUI = this.resetAnnotationUI.bind(this);
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        super.destroy();
        if (!this.createHighlightDialog) {
            return;
        }

        if (this.commentHighlightEnabled) {
            // $FlowFixMe
            this.createHighlightDialog.removeListener(CREATE_EVENT.comment, this.highlightCurrentSelection);
            // $FlowFixMe
            this.createHighlightDialog.removeListener(CREATE_EVENT.commentPost, this.createHighlightThread);
        }

        if (this.plainHighlightEnabled) {
            this.createHighlightDialog.removeListener(CREATE_EVENT.plain, this.createPlainHighlight);
        }

        this.createHighlightDialog.destroy();
        this.createHighlightDialog = null;
    }

    /** @inheritdoc */
    init(initialScale: number = 1) {
        super.init(initialScale);

        // Allow rangy to highlight this
        this.annotatedElement.id = ID_ANNOTATED_ELEMENT;
    }

    /** @inheritdoc */
    getAnnotatedEl(containerEl: HTMLElement) {
        return containerEl.querySelector(SELECTOR_PREVIEW_DOC);
    }

    /**
     * Returns an annotation location on a document from the DOM event or null
     * if no correct annotation location can be inferred from the event. For
     * point annotations, we return the (x, y) coordinates and page the
     * point is on in PDF units with the lower left corner of the document as
     * the origin. For highlight annotations, we return the PDF quad points
     * as defined by the PDF spec and page the highlight is on.
     *
     * @param {Event} event DOM event
     * @param {AnnotationType} annotationType Type of annotation
     * @return {Object|null} Location object
     */
    getLocationFromEvent = (event: Event, annotationType: AnnotationType): ?Location => {
        let location = null;
        const zoomScale = util.getScale(this.annotatedElement);

        if (annotationType === TYPES.point) {
            let clientEvent = event;

            // $FlowFixMe
            if (this.hasTouch && event.targetTouches) {
                if (event.targetTouches.length <= 0) {
                    return location;
                }
                clientEvent = event.targetTouches[0];
            }

            // If click isn't on a page, ignore
            const eventTarget = clientEvent.target;
            const pageInfo = util.getPageInfo(eventTarget);
            const pageEl = pageInfo.pageEl ? pageInfo.pageEl : util.getPageEl(this.annotatedElement, pageInfo.page);
            if (!pageEl) {
                return location;
            }

            // If there is a selection, ignore
            if (docUtil.isSelectionPresent()) {
                return location;
            }

            // If click is inside an annotation dialog, ignore
            if (util.isInAnnotationOrMarker(event)) {
                return location;
            }

            // Store coordinates at 100% scale in PDF space in PDF units
            const pageDimensions = pageEl.getBoundingClientRect();
            const pageWidth = pageDimensions.width;
            const pageHeight = pageDimensions.height - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;
            const browserCoordinates = [
                // $FlowFixMe
                clientEvent.clientX - pageDimensions.left,
                // $FlowFixMe
                clientEvent.clientY - pageDimensions.top - PAGE_PADDING_TOP
            ];

            // If click is outside the page, ignore
            if (docUtil.isCoordOutside(browserCoordinates, pageWidth, pageHeight)) {
                return location;
            }

            let [x, y] = browserCoordinates;
            // Do not create annotation if event doesn't have coordinates
            if (Number.isNaN(x) || Number.isNaN(y)) {
                this.emit(ANNOTATOR_EVENT.error, this.localized.createError);
                return location;
            }

            const pdfCoordinates = docUtil.convertDOMSpaceToPDFSpace(browserCoordinates, pageHeight, zoomScale);
            [x, y] = pdfCoordinates;

            // We save the dimensions of the annotated element scaled to 100%
            // so we can compare to the annotated element during render time
            // and scale if needed (in case the representation changes size)
            const dimensions = {
                x: pageWidth / zoomScale,
                y: pageHeight / zoomScale
            };

            location = { x, y, page: pageInfo.page, dimensions };
        } else if (util.isHighlightAnnotation(annotationType)) {
            if (!this.highlighter || !this.highlighter.highlights.length) {
                return location;
            }

            // Get correct page
            let { pageEl, page } = util.getPageInfo(window.getSelection().anchorNode);
            if (!pageEl) {
                // The ( .. ) around assignment is required syntax
                ({ pageEl, page } = util.getPageInfo(this.annotatedElement.querySelector(`.${CLASS_RANGY_HIGHLIGHT}`)));
            }

            // Use highlight module to calculate quad points
            const { highlightEls } = docUtil.getHighlightAndHighlightEls(this.highlighter, pageEl);

            // Do not create highlight annotation if no highlights are detected
            if (highlightEls.length === 0) {
                return location;
            }

            const quadPoints = [];
            highlightEls.forEach((element) => {
                quadPoints.push(docUtil.getQuadPoints(element, pageEl, zoomScale));
            });

            // We save the dimensions of the annotated element scaled to 100%
            // so we can compare to the annotated element during render time
            // and scale if needed (in case the representation changes size)
            const pageDimensions = pageEl.getBoundingClientRect();
            const pageWidth = pageDimensions.width;
            const pageHeight = pageDimensions.height - PAGE_PADDING_TOP - PAGE_PADDING_BOTTOM;
            const dimensions = {
                x: pageWidth / zoomScale,
                y: pageHeight / zoomScale
            };

            location = { page, quadPoints, dimensions };
        }

        // $FlowFixMe
        return location;
    };

    /** @inheritdoc */
    resetAnnotationUI(pageNum?: number) {
        // $FlowFixMe
        document.getSelection().removeAllRanges();
        if (this.highlighter) {
            this.highlighter.removeAllHighlights();
        }

        if (this.createHighlightDialog) {
            this.createHighlightDialog.unmountPopover();
        }

        if (pageNum) {
            this.scaleAnnotationCanvases(pageNum);
        }
    }

    /**
     * Scales all annotation canvases for a specified page.
     *
     * @param {number} pageNum Page number
     * @return {void}
     */
    scaleAnnotationCanvases(pageNum: number) {
        const pageEl = util.getPageEl(this.annotatedElement, pageNum);

        ANNOTATION_LAYER_CLASSES.forEach((annotationLayerClass) => {
            const annotationLayerEl = pageEl.querySelector(`canvas.${annotationLayerClass}`);
            if (annotationLayerEl) {
                docUtil.scaleCanvas(pageEl, annotationLayerEl);
            }
        });
    }

    /**
     * Annotations setup.
     *
     * @return {void}
     */
    setupAnnotations() {
        super.setupAnnotations();

        // Don't bind to highlight specific handlers if we cannot highlight
        if (!this.plainHighlightEnabled && !this.commentHighlightEnabled) {
            return;
        }

        this.createHighlightDialog = new CreateHighlightDialog(this.annotatedElement, {
            hasTouch: this.hasTouch,
            allowComment: this.commentHighlightEnabled,
            allowHighlight: this.plainHighlightEnabled,
            localized: this.localized,
            container: this.container,
            headerHeight: this.headerElement.clientHeight
        });

        if (this.commentHighlightEnabled) {
            // $FlowFixMe
            this.createHighlightDialog.addListener(CREATE_EVENT.comment, this.highlightCurrentSelection);
            // $FlowFixMe
            this.createHighlightDialog.addListener(CREATE_EVENT.commentPost, this.createHighlightThread);
        }

        if (this.plainHighlightEnabled) {
            // $FlowFixMe
            this.createHighlightDialog.addListener(CREATE_EVENT.plain, this.createPlainHighlight);
        }

        // Init rangy and rangy highlight
        this.highlighter = rangy.createHighlighter();
        this.highlighter.addClassApplier(
            rangy.createClassApplier(CLASS_RANGY_HIGHLIGHT, {
                ignoreWhiteSpace: true,
                tagNames: ['span', 'a']
            })
        );
    }

    /**
     * Binds DOM event listeners.
     *
     * @return {void}
     */
    bindDOMListeners() {
        super.bindDOMListeners();

        this.container.addEventListener('resize', this.resetAnnotationUI);

        // Highlight listeners on desktop & mobile
        if (this.plainHighlightEnabled || this.commentHighlightEnabled) {
            this.annotatedElement.addEventListener('wheel', this.hideCreateDialog);

            if (this.hasTouch) {
                this.annotatedElement.addEventListener('touchend', this.hideCreateDialog);
            }
        }

        this.annotatedElement.addEventListener('click', this.clickHandler);

        // Prevent highlight creation if annotating (or plain AND comment highlights) is disabled
        if (!this.permissions.can_annotate || !(this.plainHighlightEnabled || this.commentHighlightEnabled)) {
            return;
        }

        if (this.hasTouch) {
            document.addEventListener('selectionchange', this.onSelectionChange);
        } else {
            this.annotatedElement.addEventListener('mouseup', this.highlightMouseupHandler);
            this.annotatedElement.addEventListener('dblclick', this.highlightMouseupHandler);
            this.annotatedElement.addEventListener('mousedown', this.highlightMousedownHandler);
            this.annotatedElement.addEventListener('contextmenu', this.highlightMousedownHandler);
        }
    }

    /**
     * Unbinds DOM event listeners.
     *
     * @return {void}
     */
    unbindDOMListeners() {
        super.unbindDOMListeners();

        this.container.removeEventListener('resize', this.resetAnnotationUI);
        this.annotatedElement.removeEventListener('wheel', this.hideCreateDialog);
        this.annotatedElement.removeEventListener('touchend', this.hideCreateDialog);
        this.annotatedElement.removeEventListener('click', this.clickHandler);

        if (this.highlightThrottleHandle) {
            cancelAnimationFrame(this.highlightThrottleHandle);
            this.highlightThrottleHandle = null;
        }

        Object.keys(this.modeControllers).forEach((mode) => {
            const controller = this.modeControllers[mode];
            controller.removeSelection();
        });

        if (this.hasTouch) {
            document.removeEventListener('selectionchange', this.onSelectionChange);
        } else {
            this.annotatedElement.removeEventListener('mouseup', this.highlightMouseupHandler);
            this.annotatedElement.removeEventListener('dblclick', this.highlightMouseupHandler);
            this.annotatedElement.removeEventListener('mousedown', this.highlightMousedownHandler);
            this.annotatedElement.removeEventListener('contextmenu', this.highlightMousedownHandler);
        }
    }

    /**
     * Handles click events when not in an annotation mode
     *
     * @param {Event} event - Mouse event
     * @return {void}
     */
    clickHandler = (event: Event) => {
        let mouseEvent = event;

        // $FlowFixMe
        if (this.hasTouch && event.targetTouches) {
            mouseEvent = event.targetTouches[0];
        }

        // Don't do anything if the click is in a popover
        if (util.isInDialog(mouseEvent, this.container)) {
            return;
        }

        // Hide the create dialog if click was not in the popover
        if (
            !this.isCreatingHighlight &&
            // $FlowFixMe
            this.createHighlightDialog.isVisible &&
            // $FlowFixMe
            !this.createHighlightDialog.isInHighlight(mouseEvent)
        ) {
            mouseEvent.stopPropagation();
            mouseEvent.preventDefault();
            this.resetHighlightSelection(mouseEvent);
            return;
        }

        if (this.highlightClickHandler(event)) {
            return;
        }

        this.hideAnnotations(event);

        if (this.drawEnabled) {
            const controller = this.modeControllers[TYPES.draw];
            controller.handleSelection(event);
        }
    };

    /**
     * Hides the create highlight dialog
     *
     * @param {Event} event - Mouse event
     * @return {void}
     */
    hideCreateDialog(event: ?Event) {
        if (!this.createHighlightDialog || !event || util.isInDialog(event)) {
            return;
        }

        // $FlowFixMe
        this.createHighlightDialog.unmountPopover();
        this.isCreatingHighlight = false;
    }

    /**
     * Clears the text selection and hides the create highlight dialog
     *
     * @param {Event} event - Mouse wheel event
     * @return {void}
     */
    resetHighlightSelection(event: ?Event) {
        this.hideCreateDialog(event);

        // $FlowFixMe
        document.getSelection().removeAllRanges();
        if (this.highlighter) {
            this.highlighter.removeAllHighlights();
        }
    }

    /**
     * Creates a plain highlight annotation.
     *
     * @return {void}
     */
    createPlainHighlight() {
        this.highlightCurrentSelection();
        this.createHighlightThread();
    }

    /**
     * Creates an highlight annotation thread, adds it to in-memory map, and returns it.
     *
     * @param {string} [commentText] If provided, this will save a highlight comment annotation, with commentText
     * being the text as the first comment in the thread.
     * @return {DocHighlightThread} Created doc highlight annotation thread
     */
    createHighlightThread(commentText?: string) {
        // Empty string will be passed in if no text submitted in comment
        if (commentText === '' || !this.lastHighlightEvent) {
            return null;
        }

        const isCreateDialogVisible = this.createHighlightDialog && this.createHighlightDialog.isVisible;
        if (isCreateDialogVisible) {
            // $FlowFixMe
            this.createHighlightDialog.unmountPopover();
        }

        const highlightType = commentText ? TYPES.highlight_comment : TYPES.highlight;
        const location = this.getLocationFromEvent(this.lastHighlightEvent, highlightType);
        const controller = this.modeControllers[highlightType];

        if (!location || !controller) {
            return null;
        }

        this.lastHighlightEvent = null;
        this.lastSelection = null;

        const thread = controller.registerThread({
            id: AnnotationAPI.generateID(),
            type: highlightType,
            location,
            canAnnotate: true,
            canDelete: true,
            createdBy: this.api.user,
            createdAt: new Date().toLocaleString()
        });
        if (!thread) {
            this.handleValidationError();
            return null;
        }

        thread.state = STATES.active;
        thread.save(highlightType, commentText);
        this.emit(THREAD_EVENT.save, thread.getThreadEventData());
        return thread;
    }

    /**
     * Handles changes in text selection. Used for mobile highlight creation.
     *
     * @param {Event} event The DOM event coming from interacting with the element.
     * @return {void}
     */
    onSelectionChange(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        if (this.selectionEndTimeout) {
            clearTimeout(this.selectionEndTimeout);
            this.selectionEndTimeout = null;
        }

        // Bail if mid highlight and tapping on the screen
        const selection = window.getSelection();
        const isClickOutsideCreateDialog = this.isCreatingHighlight && util.isInDialog(event);
        if (!docUtil.isValidSelection(selection) || isClickOutsideCreateDialog) {
            this.lastHighlightEvent = null;
            this.resetHighlightSelection(event);
            return;
        }

        // Do nothing if in a text area or mobile dialog or mobile create dialog is already open
        const pointController = this.modeControllers[TYPES.point];
        const isCreatingPoint = !!(pointController && pointController.pendingThreadID);
        const isPopoverActive = !!util.findClosestElWithClass(document.activeElement, CLASS_ANNOTATION_POPOVER);
        if (this.isCreatingHighlight || isCreatingPoint || isPopoverActive) {
            return;
        }

        // If we're creating a new selection, make sure to clear out to avoid
        // incorrect text being selected
        if (
            this.highlighter &&
            (!this.lastSelection || !selection || !docUtil.hasSelectionChanged(selection, this.lastSelection))
        ) {
            this.highlighter.removeAllHighlights();
        }

        this.selectionEndTimeout = setTimeout(() => {
            if (this.createHighlightDialog && !this.createHighlightDialog.isVisible) {
                this.createHighlightDialog.show(this.lastSelection);
            }
        }, SELECTION_TIMEOUT);
        this.isCreatingHighlight = true;

        const { page } = util.getPageInfo(event.target);

        // Set all annotations on current page that are in the 'active' state to 'inactive'
        if (this.plainHighlightEnabled) {
            this.modeControllers[TYPES.highlight].applyActionToThreads((thread) => thread.reset(), page);
        }

        if (this.commentHighlightEnabled) {
            this.modeControllers[TYPES.highlight_comment].applyActionToThreads((thread) => thread.reset(), page);
        }

        let mouseEvent = event;

        // $FlowFixMe
        if (this.hasTouch && event.targetTouches) {
            mouseEvent = event.targetTouches[0];
        }
        this.lastHighlightEvent = mouseEvent;
        this.lastSelection = selection;
    }

    /**
     * Mode controllers setup.
     *
     * @return {void}
     */
    setupControllers() {
        super.setupControllers();

        // Determine enabled annotation types before binding mode controller listeners
        this.plainHighlightEnabled = !!this.modeControllers[TYPES.highlight];
        this.commentHighlightEnabled = !!this.modeControllers[TYPES.highlight_comment];
        this.drawEnabled = !!this.modeControllers[TYPES.draw];

        if (this.commentHighlightEnabled) {
            this.modeControllers[TYPES.highlight_comment].canComment = this.commentHighlightEnabled;

            if (this.plainHighlightEnabled) {
                this.modeControllers[TYPES.highlight].canComment = this.commentHighlightEnabled;
            }
        }
    }

    /**
     * Highlight the current range of text that has been selected.
     *
     * @return {void}
     */
    highlightCurrentSelection() {
        if (!this.highlighter) {
            return;
        }

        this.highlighter.highlightSelection(CLASS_RANGY_HIGHLIGHT, {
            containerElementId: this.annotatedElement.id
        });
    }

    /**
     * Mousedown handler on annotated element. Also delegates to mousedown
     * handler for each thread.
     *
     * @param {Event} event DOM event
     * @return {void}
     */
    highlightMousedownHandler = (event: Event) => {
        this.mouseDownEvent = event;

        // $FlowFixMe
        if (this.hasTouch && event.targetTouches) {
            this.mouseDownEvent = event.targetTouches[0];
        }

        if (util.isInAnnotationOrMarker(event, this.container)) {
            this.mouseDownEvent = null;
            return;
        }

        this.isCreatingHighlight = true;

        if (this.plainHighlightEnabled) {
            this.modeControllers[TYPES.highlight].destroyPendingThreads();
        }

        if (this.commentHighlightEnabled) {
            this.modeControllers[TYPES.highlight_comment].destroyPendingThreads();
        }
    };

    /**
     * Returns whether any mode controller is currently creating an
     * annotation thread
     *
     * @return {boolean} Whether any controller has a pending thread
     */
    isCreatingAnnotation() {
        let isPending = false;
        Object.keys(this.modeControllers).some((mode) => {
            const controller = this.modeControllers[mode];
            if (controller.hadPendingThreads) {
                isPending = true;
            }
            return isPending;
        });

        // $FlowFixMe
        return isPending || this.createHighlightDialog.isVisible;
    }

    /**
     * Mouseup handler. Switches between creating a highlight and delegating
     * to highlight click handlers depending on whether mouse moved since
     * mousedown.
     *
     * @param {Event} event DOM event
     * @return {void}
     */
    highlightMouseupHandler = (event: Event) => {
        this.isCreatingHighlight = false;

        if (util.isInAnnotationOrMarker(event, this.container)) {
            return;
        }

        if (this.highlighter) {
            this.highlighter.removeAllHighlights();
        }

        let mouseUpEvent = event;

        // $FlowFixMe
        if (this.hasTouch && event.targetTouches) {
            mouseUpEvent = event.targetTouches[0];
        }

        const { clientX, clientY } = this.mouseDownEvent;
        const hasMouseMoved =
            // $FlowFixMe
            (clientX && clientX !== mouseUpEvent.clientX) || (clientY && clientY !== mouseUpEvent.clientY);

        // Creating highlights is disabled on mobile for now since the
        // event we would listen to, selectionchange, fires continuously and
        // is unreliable. If the mouse moved or we double clicked text,
        // we trigger the create handler instead of the click handler
        if ((this.createHighlightDialog && hasMouseMoved) || event.type === 'dblclick') {
            this.highlightCreateHandler(event);
        } else {
            this.resetHighlightSelection(event);
        }
    };

    /**
     * Handler for creating a pending highlight thread from the current
     * selection. Default creates highlight threads as ANNOTATION_TYPE_HIGHLIGHT.
     * If the user adds a comment, the type changes to
     * ANNOTATION_TYPE_HIGHLIGHT_COMMENT.
     *
     * @param {Event} event DOM event
     * @return {void}
     */
    highlightCreateHandler = (event: Event) => {
        event.stopPropagation();
        event.preventDefault();

        const selection = window.getSelection();
        if (!docUtil.isValidSelection(selection)) {
            return;
        }

        // Select page of first node selected
        const { pageEl } = util.getPageInfo(selection.anchorNode);
        if (!pageEl) {
            return;
        }

        // $FlowFixMe
        this.createHighlightDialog.show(selection);
        this.lastHighlightEvent = event;
    };

    /**
     * Highlight click handler. Delegates click event to click handlers for
     * threads on the page.
     *
     * @param {Event} event DOM event
     * @return {void}
     */
    highlightClickHandler(event: Event) {
        if (!this.plainHighlightEnabled && !this.commentHighlightEnabled) {
            return false;
        }

        // $FlowFixMe
        if (this.createHighlightDialog.isVisible) {
            return true;
        }

        this.activeThread = null;
        this.consumed = false;

        let plainThreads = [];
        let commentThreads = [];

        const location = this.getLocationFromEvent(event, TYPES.point);
        if (this.plainHighlightEnabled) {
            plainThreads = this.modeControllers[TYPES.highlight].getIntersectingThreads(event, location);
        }

        if (this.commentHighlightEnabled) {
            commentThreads = this.modeControllers[TYPES.highlight_comment].getIntersectingThreads(event, location);
        }

        this.hideAnnotations(event);

        const intersectingThreads = [].concat(plainThreads, commentThreads);
        intersectingThreads.forEach((thread) => this.clickThread(event, thread));

        // Show active thread last
        if (this.activeThread) {
            this.activeThread.show();
            return true;
        }

        this.resetHighlightSelection(event);
        return false;
    }

    /**
     * Delegates click event to click handlers for threads on the page.
     *
     * @param {Event} event Mouse event
     * @param {AnnotationThread} thread Highlight thread to check
     * @return {void}
     */
    clickThread = (event: Event, thread: AnnotationThread) => {
        if (thread.state === STATES.pending) {
            // Destroy any pending highlights on click outside the highlight
            if (thread.type === TYPES.point) {
                thread.destroy();
            } else {
                thread.cancelFirstComment();
            }
        } else if (util.isHighlightAnnotation(thread.type)) {
            // We use this to prevent a mousedown from activating two different
            // highlights at the same time - this tracks whether a delegated
            // mousedown activated some highlight, and then informs the other
            // keydown handlers to not activate
            const threadActive = thread.onClick(event, this.consumed);
            if (threadActive) {
                this.activeThread = thread;
            }

            this.consumed = this.consumed || threadActive;
        } else {
            thread.unmountPopover();
        }
    };

    /**
     * Show normal cursor instead of text cursor.
     *
     * @return {void}
     */
    useDefaultCursor() {
        this.annotatedElement.classList.add(CLASS_DEFAULT_CURSOR);
    }

    /**
     * Use text cursor.
     *
     * @return {void}
     */
    removeDefaultCursor() {
        this.annotatedElement.classList.remove(CLASS_DEFAULT_CURSOR);
    }

    /**
     * Helper to remove a Rangy highlight by deleting the highlight in the
     * internal highlighter list that has a matching ID. We can't directly use
     * the highlighter's removeHighlights since the highlight could possibly
     * not be a true Rangy highlight object.
     *
     * @param {Object} highlight Highlight to delete.
     * @return {void}
     */
    removeRangyHighlight(highlight: Object) {
        const { highlights } = this.highlighter;
        if (!Array.isArray(highlights)) {
            return;
        }

        const matchingHighlights = highlights.filter((internalHighlight) => {
            return internalHighlight.id === highlight.id;
        });

        this.highlighter.removeHighlights(matchingHighlights);
    }

    /**
     * Handle events emitted by the annotation service
     *
     * @param {Object} [data] Annotation service event data
     * @param {string} [data.event] Annotation service event
     * @param {string} [data.data] Annotation event data
     * @return {void}
     */
    handleControllerEvents(data: Object) {
        switch (data.event) {
            case CONTROLLER_EVENT.toggleMode:
                this.resetHighlightSelection(data.event);
                break;
            case CONTROLLER_EVENT.bindDOMListeners:
                this.hideCreateDialog(data);
                break;
            case CONTROLLER_EVENT.renderPage:
                this.renderPage(data.data);
                break;
            default:
        }
        super.handleControllerEvents(data);
    }

    /**
     * For filtering out and only showing the first thread in a list of threads.
     *

     * @param {Object} thread The annotation thread to either hide or show
     * @param {number} index The index of the annotation thread
     * @return {void}
     */
    showFirstDialogFilter(thread: AnnotationThread, index: number) {
        if (index === 0) {
            thread.show();
        } else {
            thread.unmountPopover();
        }
    }
}

export default DocAnnotator;
