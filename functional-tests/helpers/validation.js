/* eslint-disable prefer-arrow-callback, no-var, func-names */
const { expect } = require('chai');
const {
    SELECTOR_ANNOTATION_POPOVER,
    SELECTOR_ACTIVE,
    SELECTOR_INPUT_SUBMIT_BTN,
    SELECTOR_INVALID_INPUT,
    SELECTOR_INPUT_CANCEL_BTN,
    SELECTOR_USER_NAME,
    SELECTOR_DRAFTEDITOR_CONTENT,
    SELECTOR_ACTION_CONTROLS,
    SELECTOR_COMMENT_LIST,
    SELECTOR_COMMENT_LIST_ITEM
} = require('../helpers/constants');


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
    I.waitForVisible(`${containerSel} ${SELECTOR_INPUT_CANCEL_BTN}`);
    I.waitForVisible(`${containerSel} ${SELECTOR_INPUT_SUBMIT_BTN}`);
    expect(yield I.grabValueFrom(`${containerSel} ${textareaSel}`)).to.equal('');

    const message = 'Write a comment';
    expect(yield I.grabAttributeFrom(`${containerSel} ${textareaSel}`, 'placeholder')).to.equal(message);

    I.click(`${containerSel} ${SELECTOR_INPUT_SUBMIT_BTN}`);
    I.waitForVisible(`${containerSel} ${textareaSel}${SELECTOR_INVALID_INPUT}`);
    I.waitForVisible(SELECTOR_ANNOTATION_POPOVER);
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
    I.waitForVisible(SELECTOR_ANNOTATION_POPOVER);
    I.waitForVisible(SELECTOR_COMMENT_LIST);
    I.waitNumberOfVisibleElements(SELECTOR_COMMENT_LIST_ITEM, 1);
    validateTextarea(I, SELECTOR_ACTION_CONTROLS, SELECTOR_DRAFTEDITOR_CONTENT);
    I.waitForText('Kanye West', 15, `${SELECTOR_COMMENT_LIST_ITEM} ${SELECTOR_USER_NAME}`);
}

exports.validateIconColor = validateIconColor;
exports.validateAnnotation = validateAnnotation;
exports.validateTextarea = validateTextarea;