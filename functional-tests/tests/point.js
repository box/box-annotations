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
    SELECTOR_ANNOTATION_BUTTON_CANCEL
} = require('../helpers/constants');
const { expect } = require('chai');

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

Scenario('Cancel a new point annotation @desktop', function*(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);

    I.say('Enter point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT);
    I.waitForVisible(SELECTOR_POINT_MODE_HEADER);

    I.say('Create point annotation');
    I.click(SELECTOR_TEXT_LAYER);
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