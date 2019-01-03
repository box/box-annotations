/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_ANNOTATION_POPOVER,
    SELECTOR_ANNOTATION_COMMENT,
    SELECTOR_DELETE_COMMENT_BTN,
    SELECTOR_DRAFTEDITOR_CONTENT,
    SELECTOR_ACTION_CONTROLS,
    SELECTOR_INPUT_SUBMIT_BTN,
    SELECTOR_INPUT_CANCEL_BTN,
    SELECTOR_ANNOTATION_POINT_MARKER,
    SELECTOR_ANNNOTATION_MODE_BACKGROUND,
    SELECTOR_ANNOTATION_BUTTON_POINT,
    SELECTOR_ANNOTATION_BUTTON_POINT_EXIT,
    SELECTOR_HIGHLIGHT_CONTROLS,
    SELECTOR_POINT_MODE_HEADER,
    SELECTOR_COMMENT_LIST_ITEM,
    SELECTOR_COMMENT_DELETE_YES
} = require('../helpers/constants');
const { validateTextarea, validateAnnotation } = require('./validation');

/**
 * Replies to an annotation thread
 *
 * @param {Object} I - the codeceptjs I
 *
 * @return {void}
 */
function replyToThread(I) {
    I.say('Reply to highlight comment annotation');
    I.fillField(SELECTOR_DRAFTEDITOR_CONTENT, 'Sample reply');
    I.click(SELECTOR_INPUT_SUBMIT_BTN);
    validateTextarea(I, SELECTOR_ANNOTATION_POPOVER);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 2);

    I.say('Cancel a reply to a highlight comment annotation');
    I.fillField(SELECTOR_DRAFTEDITOR_CONTENT, 'Sample canceled reply');
    I.click(SELECTOR_INPUT_CANCEL_BTN);
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
function deleteAnnotation(I, annotationCount, selector = SELECTOR_COMMENT_LIST_ITEM) {
    I.waitNumberOfVisibleElements(SELECTOR_COMMENT_LIST_ITEM, annotationCount);
    I.click(SELECTOR_COMMENT_LIST_ITEM);

    I.say('Delete the annotation');
    I.waitForEnabled(`${selector} ${SELECTOR_DELETE_COMMENT_BTN}`, 9);
    I.click(`${selector} ${SELECTOR_DELETE_COMMENT_BTN}`);
    I.click(`${SELECTOR_COMMENT_DELETE_YES}`);

    I.say('Annotation should be deleted');
    if (annotationCount > 1) {
        I.waitNumberOfVisibleElements(SELECTOR_COMMENT_LIST_ITEM, annotationCount - 1);
        I.waitForVisible(SELECTOR_ANNOTATION_POPOVER);
    } else {
        I.waitForDetached(SELECTOR_ANNOTATION_POPOVER, 1);
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
    I.dontSeeElement(SELECTOR_HIGHLIGHT_CONTROLS);
    I.waitForVisible('.bp-notification');
    I.waitForVisible(SELECTOR_ANNNOTATION_MODE_BACKGROUND);
    I.waitForVisible(SELECTOR_POINT_MODE_HEADER);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
}

/**
 * Exit point annotation mode
 *
 * @param {Object} I - the codeceptjs I
 *
 * @return {void}
 */
function exitPointMode(I) {
    I.say('Exit point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);
    I.dontSeeElement(SELECTOR_ANNNOTATION_MODE_BACKGROUND);
    I.dontSeeElement(SELECTOR_POINT_MODE_HEADER);
    I.dontSeeElement(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
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
    I.waitForVisible(SELECTOR_ANNOTATION_POPOVER);
    validateTextarea(I, SELECTOR_ACTION_CONTROLS, SELECTOR_DRAFTEDITOR_CONTENT);

    I.say('Cancel point annotation');
    I.click(SELECTOR_INPUT_CANCEL_BTN);
    I.waitForInvisible(SELECTOR_ANNOTATION_POPOVER, 1);
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
    I.fillField(SELECTOR_DRAFTEDITOR_CONTENT, 'Sample comment');
    I.click(SELECTOR_INPUT_SUBMIT_BTN);
    validateAnnotation(I);
    I.waitNumberOfVisibleElements(SELECTOR_COMMENT_LIST_ITEM, 1);

    /*
     * Delete the point annotation
     */
    deleteAnnotation(I, 1);
    I.waitForDetached(SELECTOR_ANNOTATION_POINT_MARKER, 1);

    exitPointMode(I);
}

exports.replyToThread = replyToThread;
exports.deleteAnnotation = deleteAnnotation;
exports.enterPointMode = enterPointMode;
exports.exitPointMode = exitPointMode;
exports.cancelPointAnnotation = cancelPointAnnotation;
exports.createReplyDeletePoint = createReplyDeletePoint;