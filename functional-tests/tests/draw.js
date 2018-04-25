/* eslint-disable prefer-arrow-callback, no-var, func-names */
const {
    SELECTOR_TEXT_LAYER,
    SELECTOR_DISABLED,
    SELECTOR_ANNOTATIONS_LOADED,
    SELECTOR_ANNNOTATION_MODE_BACKGROUND,
    SELECTOR_ANNOTATION_BUTTON_DRAW,
    SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO,
    SELECTOR_ANNOTATION_BUTTON_DRAW_REDO,
    SELECTOR_ANNOTATION_BUTTON_DRAW_POST,
    SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL,
    SELECTOR_ANNOTATION_LAYER_DRAW_IN_PROGRESS,
    SELECTOR_ANNOTATION_DRAWING_DIALOG,
    SELECTOR_ADD_DRAWING_BTN,
    SELECTOR_ANNOTATION_DRAWING_LABEL,
    SELECTOR_DELETE_DRAWING_BTN
} = require('../helpers/constants');

const { draw, clickAtLocation } = require('../helpers/mouseEvents');

Feature('Draw Annotation Sanity');

Before(function(I) {
    I.amOnPage('/');
});

Scenario('Create/Delete drawing @desktop', function(I) {
    /*
     * Can enter/exit drawing mode properly @desktop
     */
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_DRAW);

    I.say('Enter draw annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW);
    I.waitForVisible('.bp-notification');
    I.waitForVisible(SELECTOR_ANNNOTATION_MODE_BACKGROUND);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_DRAW_POST);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL);

    I.say('Undo/redo buttons should be disabled');
    I.waitForVisible(`${SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO}${SELECTOR_DISABLED}`);
    I.waitForVisible(`${SELECTOR_ANNOTATION_BUTTON_DRAW_REDO}${SELECTOR_DISABLED}`);

    I.say('Exit draw annotations mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW_CANCEL);
    I.dontSeeElement(SELECTOR_ANNNOTATION_MODE_BACKGROUND);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_DRAW);

    /*
     * Cancel a new drawing annotation
     */
    I.say('Enter draw annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW);
    I.click(SELECTOR_TEXT_LAYER);

    draw(I, SELECTOR_TEXT_LAYER);
    I.waitForVisible(SELECTOR_ANNOTATION_LAYER_DRAW_IN_PROGRESS);
    I.waitForVisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);

    I.say('Undo/redo buttons should be disabled');
    I.waitForEnabled(SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO);
    I.waitForVisible(`${SELECTOR_ANNOTATION_BUTTON_DRAW_REDO}${SELECTOR_DISABLED}`);

    I.say('Cancel drawing');
    I.click(SELECTOR_DELETE_DRAWING_BTN);
    I.waitForInvisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);

    /*
     * Create/Delete a drawing annotation w/ drawing dialog
     */
    draw(I, SELECTOR_TEXT_LAYER, 100);
    I.waitForVisible(SELECTOR_ANNOTATION_LAYER_DRAW_IN_PROGRESS);
    I.waitForVisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);

    I.say('Undo/redo buttons should be appropriately disabled');
    I.waitForEnabled(SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO);
    I.waitForVisible(`${SELECTOR_ANNOTATION_BUTTON_DRAW_REDO}${SELECTOR_DISABLED}`);
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO);
    I.waitForVisible(`${SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO}${SELECTOR_DISABLED}`);
    I.waitForEnabled(SELECTOR_ANNOTATION_BUTTON_DRAW_REDO);
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW_REDO);

    I.say('Save drawing');
    I.click(SELECTOR_ADD_DRAWING_BTN);
    I.waitForInvisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW_POST);

    I.say('Select drawing');
    clickAtLocation(I, SELECTOR_TEXT_LAYER, 300);
    I.scrollTo(SELECTOR_ANNOTATION_DRAWING_DIALOG);
    I.waitForVisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);

    I.say('Drawing should have a boundary and dialog should appear');
    I.waitForText('Kanye West drew', 9, SELECTOR_ANNOTATION_DRAWING_LABEL);
    I.waitForEnabled(SELECTOR_DELETE_DRAWING_BTN);

    I.say('Delete drawing');
    I.click(SELECTOR_DELETE_DRAWING_BTN);
    I.waitForInvisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);
});

Scenario('Create/Delete a drawing by exiting mode @desktop', function(I) {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_DRAW);

    I.say('Enter draw annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW);
    I.click(SELECTOR_TEXT_LAYER);

    draw(I, SELECTOR_TEXT_LAYER, 50);
    I.waitForVisible(SELECTOR_ANNOTATION_LAYER_DRAW_IN_PROGRESS);
    I.waitForVisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);

    I.say('Save drawing');
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW_POST);
    I.waitForInvisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);

    I.say('Select drawing');
    clickAtLocation(I, SELECTOR_TEXT_LAYER, 300);
    I.scrollTo(SELECTOR_ANNOTATION_DRAWING_DIALOG);
    I.waitForVisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);

    I.say('Drawing should have a boundary and dialog should appear');
    I.waitForText('Kanye West drew', 9, SELECTOR_ANNOTATION_DRAWING_LABEL);
    I.waitForEnabled(SELECTOR_DELETE_DRAWING_BTN);

    I.say('Delete drawing');
    I.click(SELECTOR_DELETE_DRAWING_BTN);
    I.waitForInvisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);
});