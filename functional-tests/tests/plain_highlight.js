/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_TEXT_LAYER,
    SELECTOR_ANNOTATIONS_LOADED,
    SELECTOR_HIGHLIGHT_CONTROLS,
    SELECTOR_ANNOTATION_POPOVER,
    SELECTOR_HIGHLIGHT_BTN,
    SELECTOR_ANNOTATOR_LABEL
} = require('../helpers/constants');

const { selectText } = require('../helpers/mouseEvents');
const { validateIconColor } = require('../helpers/validation');
const { cleanupAnnotations } = require('../helpers/cleanup');

Feature('Plain Highlight Annotation Sanity');

Before(function(I) {
    I.amOnPage('/');
});

After(function() {
    cleanupAnnotations();
});

Scenario('Create/Delete a new plain highlight annotation @desktop @doc', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    /*
     * Create plain highlight annotation
     */
    I.say('Highlight dialog should appear after selecting text');
    selectText(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_HIGHLIGHT_CONTROLS);

    I.say('Highlight selected text');
    I.click(SELECTOR_HIGHLIGHT_BTN);

    I.say('Highlight should be created and dialog should appear');
    I.waitForVisible(SELECTOR_HIGHLIGHT_CONTROLS);
    I.waitForText('Kanye West highlighted', 9, SELECTOR_ANNOTATOR_LABEL);
    I.waitForEnabled(SELECTOR_HIGHLIGHT_BTN);

    validateIconColor(I, `${SELECTOR_HIGHLIGHT_BTN}`, 'rgb(255, 201, 0)');

    /*
     * Delete plain highlight annotation
     */
    I.say('Delete the highlight annotation');
    I.click(`${SELECTOR_HIGHLIGHT_BTN}`);

    I.say('Highlight should be deleted');
    I.waitForDetached(SELECTOR_ANNOTATION_POPOVER, 1);
});
