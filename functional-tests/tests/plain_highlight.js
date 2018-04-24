/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_TEXT_LAYER,
    SELECTOR_ANNOTATIONS_LOADED,
    SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG,
    SELECTOR_ANNOTATION_DIALOG,
    SELECTOR_ADD_HIGHLIGHT_BTN,
    SELECTOR_HIGHLIGHT_LABEL
} = require('../helpers/constants');

const { selectText } = require('../helpers/mouseEvents');

Feature('Plain Highlight Annotation Sanity');

Before(function(I) {
    I.amOnPage('/');
});

Scenario('Create a new plain highlight annotation @desktop', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    I.say('Highlight dialog should appear after selecting text');
    selectText(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);

    I.say('Highlight selected text');
    I.click(SELECTOR_ADD_HIGHLIGHT_BTN);

    I.say('Highlight should be created and dialog should appear');
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.waitForText('Kanye West highlighted', 9, SELECTOR_HIGHLIGHT_LABEL);
    I.waitForEnabled(SELECTOR_ADD_HIGHLIGHT_BTN);
});

Scenario('Delete the plain highlight annotation @desktop', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    I.say('Highlight dialog should appear on click');
    I.click(`${SELECTOR_TEXT_LAYER} div`);
    I.waitForVisible(SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);

    I.say('Delete the highlight annotation');
    I.click(SELECTOR_ADD_HIGHLIGHT_BTN);

    I.say('Highlight should be deleted');
    I.waitForDetached(SELECTOR_ANNOTATION_DIALOG, 5);
});
