/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_ANNOTATION_DIALOG,
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
    SELECTOR_CANCEL_DELETE_BTN,
    SELECTOR_REPLY_CONTAINER
} = require('../helpers/constants');
const { expect } = require('chai');

async function validateIconColor(I, selector, color) {
    I.waitForElement(selector);
    const clr = await I.grabCssPropertyFrom(`${selector} svg`, 'fill');
    expect(clr).to.equal(color);
}

function* validateTextarea(I, containerSel, textareaSel) {
    I.say(`Validate ${containerSel} ${textareaSel}`);
    I.waitForVisible(`${containerSel} ${textareaSel}${SELECTOR_ACTIVE}`);
    I.waitForVisible(`${containerSel} ${SELECTOR_ANNOTATION_BUTTON_CANCEL}`);
    I.waitForVisible(`${containerSel} ${SELECTOR_ANNOTATION_BUTTON_POST}`);
    expect(yield I.grabValueFrom(`${containerSel} ${textareaSel}`)).to.equal('');

    const message = textareaSel === SELECTOR_REPLY_CONTAINER ? 'Post a reply...' : 'Add a comment here...';
    expect(yield I.grabAttributeFrom(`${containerSel} ${textareaSel}`, 'placeholder')).to.equal(message);

    I.click(`${containerSel} ${SELECTOR_ANNOTATION_BUTTON_POST}`);
    I.waitForVisible(`${containerSel} ${textareaSel}${SELECTOR_INVALID_INPUT}`);
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
}

function validateAnnotation(I) {
    I.say('Dialog should contain new annotation');
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.see('Posting...', SELECTOR_USER_NAME);
    I.waitForVisible(SELECTOR_ANNOTATION_CONTAINER);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 1);
    I.waitForEnabled(SELECTOR_DELETE_COMMENT_BTN);
    I.waitForVisible(SELECTOR_PROFILE_IMG_CONTAINER);
    I.waitForText('Kanye West', 10, SELECTOR_USER_NAME);

    validateTextarea(I, SELECTOR_REPLY_CONTAINER, SELECTOR_REPLY_TEXTAREA);
}

function validateReply(I) {
    I.say('Reply should be added to dialog');
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.waitForVisible(SELECTOR_ANNOTATION_CONTAINER);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 2);
    I.waitForEnabled(SELECTOR_DELETE_COMMENT_BTN);
    I.waitForVisible(SELECTOR_PROFILE_IMG_CONTAINER);
    I.waitForText('Kanye West', 10, SELECTOR_USER_NAME);

    validateTextarea(I, SELECTOR_REPLY_CONTAINER, SELECTOR_REPLY_TEXTAREA);
}

function validateDeleteConfirmation(I) {
    I.say('Validate delete confirmation');
    I.waitForText('Delete this annotation?', 10, SELECTOR_DELETE_CONFIRM_MESSAGE);
    I.waitForVisible(SELECTOR_CONFIRM_DELETE_BTN);
    I.waitForVisible(SELECTOR_CANCEL_DELETE_BTN);

    // Cancel annotation delete
    I.click(SELECTOR_CANCEL_DELETE_BTN);
    I.waitForInvisible(SELECTOR_DELETE_CONFIRM_MESSAGE);

    // Delete the annotation
    I.click(SELECTOR_DELETE_COMMENT_BTN);

    // Delete confirmation should appear
    I.waitForVisible(SELECTOR_CONFIRM_DELETE_BTN);
    I.click(SELECTOR_CONFIRM_DELETE_BTN);
}

exports.validateIconColor = validateIconColor;
exports.validateAnnotation = validateAnnotation;
exports.validateDeleteConfirmation = validateDeleteConfirmation;
exports.validateReply = validateReply;
exports.validateTextarea = validateTextarea;