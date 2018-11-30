/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_PREVIEW_IMAGE,
    SELECTOR_TEXT_LAYER,
    SELECTOR_ANNOTATIONS_LOADED,
    SELECTOR_ANNOTATION_BUTTON_POINT,
    SELECTOR_HIGHLIGHT_CONTROLS
} = require('../helpers/constants');

const {
    enterPointMode,
    cancelPointAnnotation,
    createReplyDeletePoint
} = require('../helpers/actions');

const { clickAtLocation, selectText } = require('../helpers/mouseEvents');
const { cleanupAnnotations } = require('../helpers/cleanup');

Feature('Point Annotation Sanity');

Before(function(I) {
    I.amOnPage('/');
});

After(function() {
    cleanupAnnotations();
});

Scenario('Create/Delete point annotation @desktop @doc', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);

    I.say('Selected text will be cleared on entering point mode');
    selectText(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_HIGHLIGHT_CONTROLS);

    enterPointMode(I);

    I.say('Create point annotation');
    clickAtLocation(I, SELECTOR_TEXT_LAYER);
    cancelPointAnnotation(I);

    I.say('Create point annotation');
    clickAtLocation(I, SELECTOR_TEXT_LAYER);
    createReplyDeletePoint(I);
});

Scenario('Create/Delete point annotation @desktop @image', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);

    enterPointMode(I);

    I.say('Create point annotation');
    I.click(SELECTOR_PREVIEW_IMAGE);
    cancelPointAnnotation(I);

    I.say('Create point annotation');
    I.click(SELECTOR_PREVIEW_IMAGE);
    createReplyDeletePoint(I);
});