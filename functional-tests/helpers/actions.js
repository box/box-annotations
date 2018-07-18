/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_ANNOTATION_DIALOG,
    SELECTOR_ANNOTATION_BUTTON_POST,
    SELECTOR_ANNOTATION_BUTTON_CANCEL,
    SELECTOR_ANNOTATION_COMMENT,
    SELECTOR_DELETE_COMMENT_BTN,
    SELECTOR_REPLY_TEXTAREA,
    SELECTOR_REPLY_CONTAINER,
    SELECTOR_ANNOTATION_POINT_MARKER,
    SELECTOR_ANNOTATION_TEXTAREA,
    SELECTOR_ANNNOTATION_MODE_BACKGROUND,
    SELECTOR_ANNOTATION_BUTTON_POINT,
    SELECTOR_ANNOTATION_BUTTON_POINT_EXIT,
    SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG,
    SELECTOR_POINT_MODE_HEADER
} = require('../helpers/constants');
const { validateReply, validateDeleteConfirmation, validateTextarea, validateAnnotation } = require('./validation');

/**
 * Replies to an annotation thread
 *
 * @param {Object} I - the codeceptjs I
 *
 * @return {void}
 */
function replyToThread(I) {
    I.say('Reply to highlight comment annotation');
    I.fillField(SELECTOR_REPLY_TEXTAREA, 'Sample reply');
    I.click(`${SELECTOR_REPLY_CONTAINER} ${SELECTOR_ANNOTATION_BUTTON_POST}`);
    validateReply(I, SELECTOR_ANNOTATION_DIALOG);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 2);

    I.say('Cancel a reply to a highlight comment annotation');
    I.fillField(SELECTOR_REPLY_TEXTAREA, 'Sample canceled reply');
    I.click(`${SELECTOR_REPLY_CONTAINER} ${SELECTOR_ANNOTATION_BUTTON_CANCEL}`);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 1);
}

/**
 * Replies to an annotation thread
 *
 * @param {Object} I - the codeceptjs I
 * @param {number} annotationCount - current number of annotations in threads
 * @param {string} selector - the selector to use, defaults to .annotation-comment
 *
 * @return {void}
 */
function deleteAnnotation(I, annotationCount, selector = SELECTOR_ANNOTATION_COMMENT) {
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, annotationCount);

    I.say('Delete the annotation');
    I.waitForEnabled(`${selector} ${SELECTOR_DELETE_COMMENT_BTN}`, 9);
    I.click(`${selector} ${SELECTOR_DELETE_COMMENT_BTN}`);
    validateDeleteConfirmation(I, selector);

    I.say('Annotation should be deleted');
    if (annotationCount > 1) {
        I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, annotationCount - 1);
        I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    } else {
        I.waitForDetached(SELECTOR_ANNOTATION_DIALOG, 1);
    }
}

/**
 * Enter point annotation mode
 *
 * @param {Object} I - the codeceptjs I
 *
 * @return {void}
 */
function enterPointMode(I) {
    I.say('Enter point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT);
    I.dontSeeElement(SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);
    I.waitForVisible('.bp-notification');
    I.waitForVisible(SELECTOR_ANNNOTATION_MODE_BACKGROUND);
    I.waitForVisible(SELECTOR_POINT_MODE_HEADER);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
}

/**
 * Cancel a point annotation
 *
 * @param {Object} I - the codeceptjs I
 *
 * @return {void}
 */
function cancelPointAnnotation(I) {
    I.waitForVisible(SELECTOR_ANNOTATION_POINT_MARKER);

    I.say('Annotation dialog should appear with focus on the textarea');
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    validateTextarea(I, '[data-section="create"]', SELECTOR_ANNOTATION_TEXTAREA);

    I.say('Cancel point annotation');
    I.click(`[data-section="create"] ${SELECTOR_ANNOTATION_BUTTON_CANCEL}`);
    I.waitForInvisible(SELECTOR_ANNOTATION_DIALOG, 1);
    I.waitForInvisible(SELECTOR_ANNOTATION_POINT_MARKER, 1);
}


/**
 * Create/Reply to/Delete a point annotation
 *
 * @param {Object} I - the codeceptjs I
 *
 * @return {void}
 */
function createReplyDeletePoint(I) {
    /*
     * Create/reply to a new point annotation
     */
    I.waitForVisible(SELECTOR_ANNOTATION_POINT_MARKER);

    I.say('Post point annotation');
    I.fillField(`[data-section="create"] ${SELECTOR_ANNOTATION_TEXTAREA}`, 'Sample comment');
    I.click(`[data-section="create"] ${SELECTOR_ANNOTATION_BUTTON_POST}`);
    validateAnnotation(I);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 1);

    /*
     * Delete the point annotation
     */
    deleteAnnotation(I, 1);
    I.waitForDetached(SELECTOR_ANNOTATION_POINT_MARKER, 1);

    I.say('Exit point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
    I.dontSeeElement(SELECTOR_ANNNOTATION_MODE_BACKGROUND);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);
}

exports.replyToThread = replyToThread;
exports.deleteAnnotation = deleteAnnotation;
exports.enterPointMode = enterPointMode;
exports.cancelPointAnnotation = cancelPointAnnotation;
exports.createReplyDeletePoint = createReplyDeletePoint;