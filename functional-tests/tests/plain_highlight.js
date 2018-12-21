/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_TEXT_LAYER,
    SELECTOR_ANNOTATIONS_LOADED,
    SELECTOR_HIGHLIGHT_CONTROLS,
    SELECTOR_ANNOTATION_POPOVER,
    SELECTOR_HIGHLIGHT_BTN,
    SELECTOR_SAVED_HIGHLIGHT,
    SELECTOR_ANNOTATOR_LABEL,
    SELECTOR_ANNOTATION_BUTTON_DRAW,
    SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL
} = require('../helpers/constants');

const { selectText, clickAtLocation } = require('../helpers/mouseEvents');
const { enterPointMode, exitPointMode } = require('../helpers/actions');
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

    /** Highlighting should still work after drawing on the file */
    I.say('Enter draw annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL);

    I.say('Exit draw annotations mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_DRAW);

    selectText(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_HIGHLIGHT_CONTROLS);

    /** Highlighting should still work after entering/exiting point mode */
    I.say('Enter point mode');
    enterPointMode(I);

    I.say('Starting creating point annotation');
    clickAtLocation(I, SELECTOR_TEXT_LAYER);

    I.say('Exit point mode');
    exitPointMode(I);
    
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

    validateIconColor(I, SELECTOR_SAVED_HIGHLIGHT, 'rgb(254, 217, 78)');

    /*
     * Delete plain highlight annotation
     */
    I.say('Delete the highlight annotation');
    I.click(`${SELECTOR_HIGHLIGHT_BTN}`);

    I.say('Highlight should be deleted');
    I.waitForDetached(SELECTOR_ANNOTATION_POPOVER, 1);
});
