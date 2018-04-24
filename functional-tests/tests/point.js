/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_TEXT_LAYER,
    SELECTOR_ANNOTATIONS_LOADED,
    SELECTOR_ANNNOTATION_MODE_BACKGROUND,
    SELECTOR_POINT_MODE_HEADER,
    SELECTOR_ANNOTATION_BUTTON_POINT,
    SELECTOR_ANNOTATION_BUTTON_POINT_EXIT,
    SELECTOR_ANNOTATION_POINT_MARKER,
    SELECTOR_ANNOTATION_DIALOG,
    SELECTOR_ANNOTATION_TEXTAREA,
    SELECTOR_ACTIVE,
    SELECTOR_ANNOTATION_BUTTON_POST,
    SELECTOR_INVALID_INPUT,
    SELECTOR_ANNOTATION_BUTTON_CANCEL,
    SELECTOR_USER_NAME,
    SELECTOR_ANNOTATION_CONTAINER,
    SELECTOR_ANNOTATION_COMMENT,
    SELECTOR_DELETE_COMMENT_BTN,
    SELECTOR_PROFILE_IMG_CONTAINER,
    SELECTOR_REPLY_TEXTAREA,
    SELECTOR_DELETE_CONFIRM_MESSAGE,
    SELECTOR_CONFIRM_DELETE_BTN,
    SELECTOR_CANCEL_DELETE_BTN
} = require('../helpers/constants');
const { expect } = require('chai');

const { clickAtLocation } = require('../helpers/mouseEvents');

Feature('Point Annotation Sanity');

Before(function(I) {
    I.amOnPage('/');
});

Scenario('Can enter/exit point mode properly @desktop', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);

    I.say('Enter point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT);
    I.waitForVisible('.bp-notification');
    I.waitForVisible(SELECTOR_ANNNOTATION_MODE_BACKGROUND);
    I.waitForVisible(SELECTOR_POINT_MODE_HEADER);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);

    I.say('Exit point annotations mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
    I.dontSeeElement(SELECTOR_ANNNOTATION_MODE_BACKGROUND);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);
});

Scenario('Cancel a new point annotation @desktop', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);

    I.say('Enter point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT);
    I.waitForVisible(SELECTOR_POINT_MODE_HEADER);

    I.say('Create point annotation');
    clickAtLocation(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_ANNOTATION_POINT_MARKER);

    I.say('Annotation dialog should appear with focus on the textarea');
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.waitForVisible(`[data-section="create"] ${SELECTOR_ANNOTATION_TEXTAREA}${SELECTOR_ACTIVE}`);

    const placeHolder = yield I.grabAttributeFrom(`[data-section="create"] ${SELECTOR_ANNOTATION_TEXTAREA}`, 'placeholder');
    expect(placeHolder).to.equal('Add a comment here...');

    I.say('Dialog validates textarea with invalid contents');
    I.click(SELECTOR_ANNOTATION_BUTTON_POST);
    I.waitForVisible(SELECTOR_INVALID_INPUT);
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);

    I.say('Cancel point annotation');
    I.click(SELECTOR_ANNOTATION_BUTTON_CANCEL);
    I.waitForInvisible(SELECTOR_ANNOTATION_DIALOG, 1);
    I.waitForInvisible(SELECTOR_ANNOTATION_POINT_MARKER, 1);
});

Scenario('Create a new highlight comment annotation @desktop', function*(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);

    I.say('Enter point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT);
    I.waitForVisible(SELECTOR_POINT_MODE_HEADER);

    I.say('Create point annotation');
    clickAtLocation(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_ANNOTATION_POINT_MARKER);

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

Scenario('Delete the point annotation @desktop', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    I.say('Point dialog should appear on click');
    I.click(SELECTOR_ANNOTATION_POINT_MARKER);
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.waitForEnabled(SELECTOR_DELETE_COMMENT_BTN);

    I.say('Delete the point annotation');
    I.click(SELECTOR_DELETE_COMMENT_BTN);

    I.say('Delete confirmation should appear');
    I.waitForText('Delete this annotation?', 10, SELECTOR_DELETE_CONFIRM_MESSAGE);
    I.waitForVisible(SELECTOR_CONFIRM_DELETE_BTN);
    I.waitForVisible(SELECTOR_CANCEL_DELETE_BTN);

    I.say('Cancel annotation delete');
    I.click(SELECTOR_CANCEL_DELETE_BTN);
    I.waitForInvisible(SELECTOR_DELETE_CONFIRM_MESSAGE);

    I.say('Delete the point annotation');
    I.click(SELECTOR_DELETE_COMMENT_BTN);

    I.say('Delete confirmation should appear');
    I.waitForVisible(SELECTOR_CONFIRM_DELETE_BTN);
    I.click(SELECTOR_CONFIRM_DELETE_BTN);

    I.say('Point annotation should be deleted');
    I.waitForDetached(SELECTOR_ANNOTATION_POINT_MARKER, 1);
    I.waitForDetached(SELECTOR_ANNOTATION_DIALOG, 1);
});