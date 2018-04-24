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
    SELECTOR_ACTIVE,
    SELECTOR_ANNOTATION_BUTTON_POST,
    SELECTOR_INVALID_INPUT,
    SELECTOR_ANNOTATION_BUTTON_CANCEL,
    SELECTOR_ANNOTATION_DIALOG,
    SELECTOR_ANNOTATION_CONTAINER,
    SELECTOR_PROFILE_IMG_CONTAINER,
    SELECTOR_USER_NAME,
    SELECTOR_DELETE_COMMENT_BTN,
    SELECTOR_DELETE_CONFIRM_MESSAGE,
    SELECTOR_CANCEL_DELETE_BTN,
    SELECTOR_CONFIRM_DELETE_BTN,
    SELECTOR_ANNOTATION_COMMENT,
    SELECTOR_REPLY_TEXTAREA
} = require('../helpers/constants');
const { expect } = require('chai');

const { selectText } = require('../helpers/mouseEvents');

Feature('Highlight Comment Annotation Sanity');

Before(function(I) {
    I.amOnPage('/');
});

Scenario('Cancel a new highlight comment annotation @desktop', function*(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    I.say('Highlight dialog should appear after selecting text');
    selectText(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_BTN);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);

    I.say('Highlight selected text');
    I.click(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);

    I.say('Create highlight dialog should appear with focus on the textarea');
    I.waitForVisible(SELECTOR_CREATE_DIALOG);
    I.waitForVisible(SELECTOR_CREATE_COMMENT);
    I.waitForVisible(`${SELECTOR_ANNOTATION_TEXTAREA}${SELECTOR_ACTIVE}`);

    const placeHolder = yield I.grabAttributeFrom(SELECTOR_ANNOTATION_TEXTAREA, 'placeholder');
    expect(placeHolder).to.equal('Add a comment here...');

    I.say('Dialog validates textarea with invalid contents');
    I.click(SELECTOR_ANNOTATION_BUTTON_POST);
    I.waitForVisible(SELECTOR_INVALID_INPUT);
    I.waitForVisible(SELECTOR_CREATE_DIALOG);

    I.say('Cancel highlight comment annotation');
    I.click(SELECTOR_ANNOTATION_BUTTON_CANCEL);
    I.waitForInvisible(SELECTOR_CREATE_COMMENT, 1);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_BTN);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);
});

Scenario('Create a new highlight comment annotation @desktop', function*(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    I.say('Highlight dialog should appear after selecting text');
    selectText(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_BTN);
    I.waitForVisible(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);

    I.say('Highlight selected text');
    I.click(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN);
    I.waitForVisible(SELECTOR_CREATE_DIALOG);
    I.waitForVisible(`${SELECTOR_ANNOTATION_TEXTAREA}${SELECTOR_ACTIVE}`);

    I.say('Post highlight annotation with comment');
    I.fillField(SELECTOR_ANNOTATION_TEXTAREA, 'Sample comment');
    I.click(SELECTOR_ANNOTATION_BUTTON_POST);

    I.say('Highlight should be created and dialog should appear with the newly added comment');
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.see('Posting...', SELECTOR_USER_NAME);
    I.waitForVisible(SELECTOR_ANNOTATION_CONTAINER);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 1);
    I.waitForEnabled(SELECTOR_DELETE_COMMENT_BTN);
    I.waitForVisible(SELECTOR_PROFILE_IMG_CONTAINER);
    I.waitForText('Kanye West', 10, SELECTOR_USER_NAME);

    I.waitForVisible(`${SELECTOR_REPLY_TEXTAREA}${SELECTOR_ACTIVE}`);
    const placeHolder = yield I.grabAttributeFrom(SELECTOR_REPLY_TEXTAREA, 'placeholder');
    expect(placeHolder).to.equal('Post a reply...');
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_CANCEL);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POST);
});

Scenario('Delete the highlight comment annotation @desktop', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    I.say('Highlight dialog should appear on click');
    I.click(`${SELECTOR_TEXT_LAYER} div`);
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.waitForEnabled(SELECTOR_DELETE_COMMENT_BTN);

    I.say('Delete the highlight annotation');
    I.click(SELECTOR_DELETE_COMMENT_BTN);

    I.say('Delete confirmation should appear');
    I.waitForText('Delete this annotation?', 10, SELECTOR_DELETE_CONFIRM_MESSAGE);
    I.waitForVisible(SELECTOR_CONFIRM_DELETE_BTN);
    I.waitForVisible(SELECTOR_CANCEL_DELETE_BTN);

    I.say('Cancel annotation delete');
    I.click(SELECTOR_CANCEL_DELETE_BTN);
    I.waitForInvisible(SELECTOR_DELETE_CONFIRM_MESSAGE);

    I.say('Delete the highlight annotation');
    I.click(SELECTOR_DELETE_COMMENT_BTN);

    I.say('Delete confirmation should appear');
    I.waitForVisible(SELECTOR_CONFIRM_DELETE_BTN);
    I.click(SELECTOR_CONFIRM_DELETE_BTN);

    I.say('Highlight should be deleted');
    I.waitForDetached(SELECTOR_ANNOTATION_DIALOG, 5);
});
