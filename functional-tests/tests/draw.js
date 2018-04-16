const {
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
    SELECTOR_DELETE_DRAWING_BTN
} = require('../helpers/constants');

const { draw } = require('../helpers/mouseEvents');

Feature('Draw Annotation Sanity');

Before((I) => {
    I.amOnPage('/');
});

Scenario('Can enter/exit drawing mode properly @desktop', (I) => {
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
});

Scenario('Cancel a new drawing annotation @desktop', (I) => {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_DRAW);

    I.say('Enter draw annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW);
    I.click('.textLayer');

    draw(I, '.textLayer');
    I.waitForVisible(SELECTOR_ANNOTATION_LAYER_DRAW_IN_PROGRESS);
    I.waitForVisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);

    I.say('Undo/redo buttons should be disabled');
    I.waitForEnabled(SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO);
    I.waitForVisible(`${SELECTOR_ANNOTATION_BUTTON_DRAW_REDO}${SELECTOR_DISABLED}`);

    I.say('Cancel drawing');
    I.click(SELECTOR_DELETE_DRAWING_BTN);
    I.waitForInvisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);
});

Scenario('Create a drawing annotation @desktop', (I) => {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_DRAW);

    I.say('Enter draw annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_DRAW);
    I.click('.textLayer');

    draw(I, '.textLayer');
    I.waitForVisible(SELECTOR_ANNOTATION_LAYER_DRAW_IN_PROGRESS);
    I.waitForVisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);

    I.say('Undo/redo buttons should be disabled');
    I.waitForEnabled(SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO);
    I.waitForVisible(`${SELECTOR_ANNOTATION_BUTTON_DRAW_REDO}${SELECTOR_DISABLED}`);

    I.say('Save drawing');
    I.click(SELECTOR_ADD_DRAWING_BTN);
    I.waitForInvisible(SELECTOR_ANNOTATION_DRAWING_DIALOG);
});