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


/**
 * Ensures the SVG icon is of the expected color
 *
 * @param {Object} I - the codeceptjs I
 * @param {string} selector - the selector to use
 * @param {string} color - rgb icon color
 *
 * @return {void}
 */
async function validateIconColor(I, selector, color) {
    I.waitForElement(selector);
    const clr = await I.grabCssPropertyFrom(`${selector} svg`, 'fill');
    expect(clr).to.equal(color);
}


/**
 * Validates that the text area appears as expected
 *
 * @param {Object} I - the codeceptjs I
 * @param {string} containerSel - the container selector to use
 * @param {string} textareaSel - the textarea selector to use
 *
 * @return {void}
 */
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

/**
 * Validates that the annotation appears as expected
 *
 * @param {Object} I - the codeceptjs I
 *
 * @return {void}
 */
function validateAnnotation(I) {
    I.say('Dialog should contain new annotation');
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.see('Posting...', `${SELECTOR_ANNOTATION_COMMENT} ${SELECTOR_USER_NAME}`);
    I.waitForVisible(SELECTOR_ANNOTATION_CONTAINER);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 1);
    I.waitForEnabled(SELECTOR_DELETE_COMMENT_BTN);
    I.waitForVisible(SELECTOR_PROFILE_IMG_CONTAINER);
    I.waitForText('Kanye West', 10, `${SELECTOR_ANNOTATION_COMMENT} ${SELECTOR_USER_NAME}`);

    validateTextarea(I, SELECTOR_REPLY_CONTAINER, SELECTOR_REPLY_TEXTAREA);
}

/**
 * Validates that the annotation reply appears as expected
 *
 * @param {Object} I - the codeceptjs I
 *
 * @return {void}
 */
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

/**
 * Validates that the delete confirmation message appears
 * and acts as expected
 *
 * @param {Object} I - the codeceptjs I
 * @param {string} selector - the selector to use
 *
 * @return {void}
 */
function validateDeleteConfirmation(I, selector = '') {
    I.say('Validate delete confirmation');
    I.waitForText('Delete this annotation?', 10, `${selector} ${SELECTOR_DELETE_CONFIRM_MESSAGE}`);
    I.waitForVisible(`${selector} ${SELECTOR_CONFIRM_DELETE_BTN}`);
    I.waitForVisible(`${selector} ${SELECTOR_CANCEL_DELETE_BTN}`);

    // Cancel annotation delete
    I.click(`${selector} ${SELECTOR_CANCEL_DELETE_BTN}`);
    I.waitForInvisible(`${selector} ${SELECTOR_DELETE_CONFIRM_MESSAGE}`);

    // Delete the annotation
    I.click(`${selector} ${SELECTOR_DELETE_COMMENT_BTN}`);

    // Delete confirmation should appear
    I.waitForVisible(`${selector} ${SELECTOR_CONFIRM_DELETE_BTN}`);
    I.click(`${selector} ${SELECTOR_CONFIRM_DELETE_BTN}`);
}

exports.validateIconColor = validateIconColor;
exports.validateAnnotation = validateAnnotation;
exports.validateDeleteConfirmation = validateDeleteConfirmation;
exports.validateReply = validateReply;
exports.validateTextarea = validateTextarea;