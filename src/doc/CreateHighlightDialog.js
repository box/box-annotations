import CreateAnnotationDialog from '../CreateAnnotationDialog';
import { ICON_HIGHLIGHT, ICON_HIGHLIGHT_COMMENT } from '../icons/icons';
import CommentBox from '../CommentBox';
import { generateBtn } from '../annotatorUtil';
import * as constants from '../annotationConstants';

const CLASS_CREATE_DIALOG = 'bp-create-annotation-dialog';
const DATA_TYPE_HIGHLIGHT = 'add-highlight-btn';
const DATA_TYPE_ADD_HIGHLIGHT_COMMENT = 'add-highlight-comment-btn';

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

    /** @property {Object} - Translated strings for dialog */
    localized;

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
        this.localized = config.localized;

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
        const highlightDialogEl = document.createElement('div');
        highlightDialogEl.classList.add(CLASS_CREATE_DIALOG);

        if (!this.isMobile) {
            const caretTemplate = document.createElement('div');
            caretTemplate.classList.add(constants.CLASS_ANNOTATION_CARET);
            caretTemplate.left = '50%';
            highlightDialogEl.appendChild(caretTemplate);
        }

        const buttonsEl = document.createElement('span');
        buttonsEl.classList.add(constants.CLASS_HIGHLIGHT_BTNS);

        if (this.allowHighlight) {
            const highlightEl = generateBtn(
                constants.CLASS_ADD_HIGHLIGHT_BTN,
                this.localized.highlightToggle,
                ICON_HIGHLIGHT,
                DATA_TYPE_HIGHLIGHT
            );
            buttonsEl.appendChild(highlightEl);
        }

        if (this.allowComment) {
            const commentEl = generateBtn(
                constants.CLASS_ADD_HIGHLIGHT_COMMENT_BTN,
                this.localized.highlightComment,
                ICON_HIGHLIGHT_COMMENT,
                DATA_TYPE_ADD_HIGHLIGHT_COMMENT
            );
            buttonsEl.appendChild(commentEl);
        }

        const dialogEl = document.createElement('div');
        dialogEl.classList.add(constants.CLASS_ANNOTATION_HIGHLIGHT_DIALOG);
        dialogEl.appendChild(buttonsEl);
        highlightDialogEl.appendChild(dialogEl);

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
            this.commentBox = new CommentBox(containerEl, {
                hasTouch: this.hasTouch,
                localized: this.localized
            });
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
