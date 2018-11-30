/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_TEXT_LAYER,
    SELECTOR_ANNOTATIONS_LOADED,
    SELECTOR_ACTION_CONTROLS,
    SELECTOR_HIGHLIGHT_CONTROLS,
    SELECTOR_HIGHLIGHT_BTN,
    SELECTOR_HIGHLIGHT_COMMENT_BTN,
    SELECTOR_DRAFTEDITOR_CONTENT,
    SELECTOR_INPUT_CANCEL_BTN,
    SELECTOR_INPUT_SUBMIT_BTN,
    SELECTOR_COMMENT_LIST_ITEM
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

Scenario('Create/Delete a new highlight comment annotation @desktop @doc', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    I.say('Highlight dialog should appear after selecting text');
    selectText(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_HIGHLIGHT_CONTROLS);
    I.waitForVisible(SELECTOR_HIGHLIGHT_BTN);
    I.waitForVisible(SELECTOR_HIGHLIGHT_COMMENT_BTN);

    I.say('Create highlight comment annotation');
    I.click(SELECTOR_HIGHLIGHT_COMMENT_BTN);
    I.waitForVisible(SELECTOR_DRAFTEDITOR_CONTENT);
    validateTextarea(I, SELECTOR_ACTION_CONTROLS, SELECTOR_DRAFTEDITOR_CONTENT);

    I.say('Cancel highlight comment annotation');
    I.click(SELECTOR_INPUT_CANCEL_BTN);
    I.waitForInvisible(SELECTOR_DRAFTEDITOR_CONTENT, 1);
    I.waitForVisible(SELECTOR_HIGHLIGHT_BTN);
    I.waitForVisible(SELECTOR_HIGHLIGHT_COMMENT_BTN);

    /*
     * Create/reply to a new highlight comment annotation
     */
    I.say('Highlight dialog should appear after selecting text');
    selectText(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_HIGHLIGHT_CONTROLS);
    I.waitForVisible(SELECTOR_HIGHLIGHT_BTN);
    I.waitForVisible(SELECTOR_HIGHLIGHT_COMMENT_BTN);

    I.say('Create highlight comment annotation');
    I.click(SELECTOR_HIGHLIGHT_COMMENT_BTN);
    I.waitForVisible(SELECTOR_DRAFTEDITOR_CONTENT);
    validateTextarea(I, SELECTOR_ACTION_CONTROLS, SELECTOR_DRAFTEDITOR_CONTENT);

    I.say('Post highlight comment annotation');
    I.fillField(SELECTOR_DRAFTEDITOR_CONTENT, 'Sample comment');
    I.click(SELECTOR_INPUT_SUBMIT_BTN);
    I.waitNumberOfVisibleElements(SELECTOR_COMMENT_LIST_ITEM, 1);
    validateAnnotation(I);

    /*
     * Delete the highlight comment annotation and reply
     */
    deleteAnnotation(I, 1);
});
