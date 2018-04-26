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
    SELECTOR_ANNOTATION_BUTTON_POST,
    SELECTOR_ANNOTATION_BUTTON_CANCEL,
    SELECTOR_ANNOTATION_COMMENT
} = require('../helpers/constants');

const { clickAtLocation } = require('../helpers/mouseEvents');
const { validateTextarea, validateAnnotation } = require('../helpers/validation');
const { deleteAnnotation } = require('../helpers/actions');
const { cleanupAnnotations } = require('../helpers/cleanup');

Feature('Point Annotation Sanity');

Before(function(I) {
    I.amOnPage('/');
});

After(function() {
    cleanupAnnotations();
});

Scenario('Create/Delete point annotation @desktop', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);

    I.say('Enter point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT);
    I.waitForVisible('.bp-notification');
    I.waitForVisible(SELECTOR_ANNNOTATION_MODE_BACKGROUND);
    I.waitForVisible(SELECTOR_POINT_MODE_HEADER);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);

    /*
     * Cancel a new point annotation
     */
    I.say('Create point annotation');
    clickAtLocation(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_ANNOTATION_POINT_MARKER);

    I.say('Annotation dialog should appear with focus on the textarea');
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    validateTextarea(I, '[data-section="create"]', SELECTOR_ANNOTATION_TEXTAREA);

    I.say('Cancel point annotation');
    I.click(SELECTOR_ANNOTATION_BUTTON_CANCEL);
    I.waitForInvisible(SELECTOR_ANNOTATION_DIALOG, 1);
    I.waitForInvisible(SELECTOR_ANNOTATION_POINT_MARKER, 1);

    /*
     * Create/reply to a new point annotation
     */
    I.say('Create point annotation');
    clickAtLocation(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_ANNOTATION_POINT_MARKER);

    I.say('Post point annotation');
    I.fillField(SELECTOR_ANNOTATION_TEXTAREA, 'Sample comment');
    I.click(SELECTOR_ANNOTATION_BUTTON_POST);
    validateAnnotation(I);
    I.waitNumberOfVisibleElements(SELECTOR_ANNOTATION_COMMENT, 1);

    /*
     * Delete the point annotation
     */
    deleteAnnotation(I, 1);
    I.waitForDetached(SELECTOR_ANNOTATION_POINT_MARKER, 1);

    I.say('Exit point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
    I.dontSeeElement(SELECTOR_ANNNOTATION_MODE_BACKGROUND);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);
});