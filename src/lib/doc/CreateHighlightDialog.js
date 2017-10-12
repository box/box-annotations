import CreateAnnotationDialog from '../CreateAnnotationDialog';
import { ICON_HIGHLIGHT, ICON_HIGHLIGHT_COMMENT } from '../icons/icons';
import CommentBox from '../CommentBox';
import * as constants from '../annotationConstants';

const TITLE_HIGHLIGHT_TOGGLE = __('annotation_highlight_toggle');
const TITLE_HIGHLIGHT_COMMENT = __('annotation_highlight_comment');
const DATA_TYPE_HIGHLIGHT = 'add-highlight-btn';
const DATA_TYPE_ADD_HIGHLIGHT_COMMENT = 'add-highlight-comment-btn';

const CARAT_TEMPLATE = `<div class="${constants.CLASS_ANNOTATION_CARET}" style="left: 50%;"></div>`;
const HIGHLIGHT_BUTTON_TEMPLATE = `
    <button class="bp-btn-plain ${constants.CLASS_ADD_HIGHLIGHT_BTN}"
        data-type="${DATA_TYPE_HIGHLIGHT}"
        title="${TITLE_HIGHLIGHT_TOGGLE}">
        ${ICON_HIGHLIGHT}
    </button>`.trim();
const COMMENT_BUTTON_TEMPLATE = `
    <button class="bp-btn-plain ${constants.CLASS_ADD_HIGHLIGHT_COMMENT_BTN}"
        data-type="${DATA_TYPE_ADD_HIGHLIGHT_COMMENT}""
        title="${TITLE_HIGHLIGHT_COMMENT}">
        ${ICON_HIGHLIGHT_COMMENT}
    </button>`.trim();

/**
 * Events emitted by this component.
 * TODO(@spramod): Evaluate if these events need to be propogated to viewer
 */
export const CreateEvents = {
    init: 'init_highlight_create',
    plain: 'plain_highlight_create',
    comment: 'comment_highlight_edit',
    commentPost: 'comment_highlight_post'
};

class CreateHighlightDialog extends CreateAnnotationDialog {
    /** @property {HTMLElement} - Container element for the dialog. */
    containerEl;

    /** @property {HTMLElement} - The clickable element for creating plain highlights. */
    highlightCreateEl;

    /** @property {HTMLElement} - The clickable element got creating comment highlights. */
    commentCreateEl;

    /** @property {HTMLElement} - The parent container to nest the dialog element in. */
    parentEl;

    /** @property {HTMLElement} - The element containing the buttons that can creaet highlights. */
    buttonsEl;

    /** @property {CommentBox} - The comment box instance. Contains area for text input and post/cancel buttons. */
    commentBox;

    /** @property {Object} - Position, on the DOM, to align the dialog to the end of a highlight. */
    position = {
        x: 0,
        y: 0
    };

    /** @property {boolean} - Whether or not we're on a mobile device. */
    isMobile;

    /** @property {boolean} - Whether or not we support touch. */
    hasTouch;

    /** @property {boolean} - Whether or not this is visible. */
    isVisible;

    /** @property {boolean} - Whether or not to allow plain highlight interaction. */
    allowHighlight;

    /** @property {boolean} - Whether or not to allow comment interactions. */
    allowComment;

    /**
     * A dialog used to create plain and comment highlights.
     *
     * [constructor]
     *
     * @param {HTMLElement} parentEl - Parent element
     * @param {Object} [config] - For configuring the dialog.
     * @param {boolean} [config.hasTouch] - True to add touch events.
     * @param {boolean} [config.isMobile] - True if on a mobile device.
     * @return {CreateHighlightDialog} CreateHighlightDialog instance
     */
    constructor(parentEl, config = {}) {
        super();

        this.allowHighlight = config.allowHighlight !== undefined ? !!config.allowHighlight : true;
        this.allowComment = config.allowComment !== undefined ? !!config.allowComment : true;

        // Explicit scope binding for event listeners
        if (this.allowHighlight) {
            this.onHighlightClick = this.onHighlightClick.bind(this);
        }

        if (this.allowComment) {
            this.onCommentClick = this.onCommentClick.bind(this);
            this.onCommentPost = this.onCommentPost.bind(this);
            this.onCommentCancel = this.onCommentCancel.bind(this);
        }
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        super.destroy();

        // Event listeners
        if (this.highlightCreateEl) {
            this.highlightCreateEl.removeEventListener('click', this.onHighlightClick);
            this.highlightCreateEl.removeEventListener('touchstart', this.stopPropagation);
            this.highlightCreateEl.removeEventListener('touchend', this.onHighlightClick);
        }

        if (this.commentCreateEl) {
            this.commentCreateEl.removeEventListener('click', this.onCommentClick);
            this.commentCreateEl.removeEventListener('touchstart', this.stopPropagation);
        }
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Fire an event notifying that the plain highlight button has been clicked.
     *
     * @param {Event} event - The DOM event coming from interacting with the element.
     * @return {void}
     */
    onHighlightClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.emit(CreateEvents.plain);
    }

    /**
     * Fire an event notifying that the comment button has been clicked. Also
     * show the comment box, and give focus to the text area conatined by it.
     *
     * @param {Event} event - The DOM event coming from interacting with the element.
     * @return {void}
     */
    onCommentClick(event) {
        event.preventDefault();
        event.stopPropagation();
        this.emit(CreateEvents.comment);

        this.commentBox.show();
        this.commentBox.focus();
        this.setButtonVisibility(false);
        this.updatePosition();
    }

    /**
     * Fire an event notifying that the post button has been pressed. Clears
     * out the comment box.
     *
     * @param {string} text - Text entered into the comment box
     * @return {void}
     */
    onCommentPost(text) {
        this.emit(CreateEvents.commentPost, text);
        if (text) {
            this.commentBox.clear();
            this.commentBox.blur();
        }
    }

    /**
     * Create the element containing highlight create and comment buttons, and comment box.
     *
     * @private
     * @return {HTMLElement} The element containing Highlight creation UI
     */
    createElement() {
        const caretTemplate = this.isMobile ? '' : CARAT_TEMPLATE;
        const highlightTemplate = this.allowHighlight ? HIGHLIGHT_BUTTON_TEMPLATE : '';
        const commentTemplate = this.allowComment ? COMMENT_BUTTON_TEMPLATE : '';

        const createHighlightDialogTemplate = `
            ${caretTemplate}
            <div>
                <div class="${constants.CLASS_ANNOTATION_HIGHLIGHT_DIALOG}">
                    <span class="${constants.CLASS_HIGHLIGHT_BTNS}">
                        ${highlightTemplate}
                        ${commentTemplate}
                    </span>
                </div>
            </div>`.trim();

        const highlightDialogEl = document.createElement('div');
        highlightDialogEl.classList.add(constants.CLASS_CREATE_DIALOG);
        highlightDialogEl.innerHTML = createHighlightDialogTemplate;

        // Get rid of the caret
        if (this.isMobile) {
            highlightDialogEl.classList.add('bp-mobile-annotation-dialog');
            highlightDialogEl.classList.add('bp-annotation-dialog');
        }

        const containerEl = highlightDialogEl.querySelector(constants.SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);

        // Reference HTML
        this.buttonsEl = containerEl.querySelector(constants.SELECTOR_HIGHLIGHT_BTNS);

        // Stop interacting with this element from triggering outside actions
        highlightDialogEl.addEventListener('click', this.stopPropagation);
        highlightDialogEl.addEventListener('mouseup', this.stopPropagation);
        highlightDialogEl.addEventListener('dblclick', this.stopPropagation);

        // Events for highlight button
        if (this.allowHighlight) {
            this.highlightCreateEl = containerEl.querySelector(constants.SELECTOR_ADD_HIGHLIGHT_BTN);
            this.highlightCreateEl.addEventListener('click', this.onHighlightClick);

            if (this.hasTouch) {
                this.highlightCreateEl.addEventListener('touchstart', this.stopPropagation);
                this.highlightCreateEl.addEventListener('touchend', this.onHighlightClick);
            }
        }

        // Events for comment button
        if (this.allowComment) {
            // Create comment box
            this.commentBox = new CommentBox(containerEl);
            this.commentCreateEl = containerEl.querySelector(`.${constants.CLASS_ADD_HIGHLIGHT_COMMENT_BTN}`);
            this.commentCreateEl.addEventListener('click', this.onCommentClick);

            // Event listeners
            this.commentBox.addListener(CommentBox.CommentEvents.post, this.onCommentPost);
            this.commentBox.addListener(CommentBox.CommentEvents.cancel, this.onCommentCancel);

            // Hide comment box, by default
            this.commentBox.hide();

            if (this.hasTouch) {
                this.commentCreateEl.addEventListener('touchstart', this.stopPropagation);
                this.commentCreateEl.addEventListener('touchend', this.onCommentClick);
            }
        }

        // touch events
        if (this.hasTouch) {
            highlightDialogEl.addEventListener('touchend', this.stopPropagation);
        }

        return highlightDialogEl;
    }
}

export default CreateHighlightDialog;
