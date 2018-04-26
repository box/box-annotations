/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_TEXT_LAYER,
    SELECTOR_ANNOTATIONS_LOADED,
    SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG,
    SELECTOR_ADD_HIGHLIGHT_BTN,
    SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN,
    SELECTOR_CREATE_DIALOG,
    SELECTOR_CREATE_COMMENT,
    SELECTOR_ANNOTATION_TEXTAREA,
    SELECTOR_ANNOTATION_BUTTON_POST,
    SELECTOR_ANNOTATION_BUTTON_CANCEL,
    SELECTOR_ANNOTATION_COMMENT
} = require('../helpers/constants');

const { selectText } = require('../helpers/mouseEvents');
const { validateTextarea, validateAnnotation } = require('../helpers/validation');
const { deleteAnnotation } = require('../helpers/actions');
const { cleanupAnnotations } = require('../helpers/cleanup');

Feature('Highlight Comment Annotation Sanity');

Before(function(I) {
    I.amOnPage('/');
});

After(function() {
    cleanupAnnotations();
});

Scenario('Create/Delete a new highlight comment annotation @desktop', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    I.say('Highlight dialog should appear after selecting text');
    selectText(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_BTN);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);

    I.say('Create highlight comment annotation');
    I.click(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);
    I.waitForVisible(SELECTOR_CREATE_DIALOG);
    validateTextarea(I, SELECTOR_CREATE_COMMENT, SELECTOR_ANNOTATION_TEXTAREA);

    I.say('Cancel highlight comment annotation');
    I.click(SELECTOR_ANNOTATION_BUTTON_CANCEL);
    I.waitForInvisible(SELECTOR_CREATE_COMMENT, 1);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_BTN);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);

    /*
     * Create/reply to a new highlight comment annotation
     */
    I.say('Highlight dialog should appear after selecting text');
    selectText(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_BTN);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);

    I.say('Create highlight comment annotation');
    I.click(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);
    I.waitForVisible(SELECTOR_CREATE_DIALOG);
    validateTextarea(I, SELECTOR_CREATE_COMMENT, SELECTOR_ANNOTATION_TEXTAREA);

    I.say('Post highlight comment annotation');
    I.fillField(SELECTOR_ANNOTATION_TEXTAREA, 'Sample comment');
    I.click(SELECTOR_ANNOTATION_BUTTON_POST);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 1);
    validateAnnotation(I);

    /*
     * Delete the highlight comment annotation and reply
     */
    deleteAnnotation(I, 1);
});
