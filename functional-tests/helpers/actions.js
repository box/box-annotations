/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_ANNOTATION_DIALOG,
    SELECTOR_ANNOTATION_BUTTON_POST,
    SELECTOR_ANNOTATION_BUTTON_CANCEL,
    SELECTOR_ANNOTATION_COMMENT,
    SELECTOR_DELETE_COMMENT_BTN,
    SELECTOR_REPLY_TEXTAREA,
    SELECTOR_REPLY_CONTAINER
} = require('../helpers/constants');
const { validateReply, validateDeleteConfirmation } = require('./validation');

function replyToThread(I) {
    I.say('Reply to highlight comment annotation');
    I.fillField(SELECTOR_REPLY_TEXTAREA, 'Sample reply');
    I.click(`${SELECTOR_REPLY_CONTAINER} ${SELECTOR_ANNOTATION_BUTTON_POST}`);
    validateReply(I, SELECTOR_ANNOTATION_DIALOG);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 2);

    I.say('Cancel a reply to a highlight comment annotation');
    I.fillField(SELECTOR_REPLY_TEXTAREA, 'Sample canceled reply');
    I.click(`${SELECTOR_REPLY_CONTAINER} ${SELECTOR_ANNOTATION_BUTTON_CANCEL}`);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 2);
}

function deleteAnnotation(I, annotationCount) {
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, annotationCount);

    I.say('Delete the annotation');
    I.click(SELECTOR_DELETE_COMMENT_BTN);
    validateDeleteConfirmation(I);

    I.say('Annotation should be deleted');
    if (annotationCount > 1) {
        I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, annotationCount - 1);
        I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    } else {
        I.waitForDetached(SELECTOR_ANNOTATION_DIALOG, 1);
    }
}

exports.replyToThread = replyToThread;
exports.deleteAnnotation = deleteAnnotation;