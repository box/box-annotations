const {
    SELECTOR_PREVIEW,
    SELECTOR_ANNOTATIONS_LOADED,
    SELECTOR_ANNOTATION_MODE,
    SELECTOR_ANNOTATION_BUTTON_POINT,
    SELECTOR_ANNOTATION_POINT_MARKER,
    SELECTOR_ANNOTATION_DIALOG,
    SELECTOR_ANNOTATION_TEXTAREA,
    SELECTOR_ANNOTATION_BUTTON_POST,
    SELECTOR_ANNOTATION_COMMENT,
    SELECTOR_REPLY_TEXTAREA,
    SELECTOR_REPLY_CONTAINER,
    SELECTOR_ANNOTATION_BUTTON_POINT_EXIT,
    SELECTOR_DELETE_COMMENT_BTN,
    SELECTOR_CONFIRM_DELETE_BTN
} = require('../helpers/constants');

Feature('Point Annotation Sanity');

Before((I) => {
    I.amOnPage('/');
});

Scenario('Create a new point annotation', (I) => {
    I.say('Point Annotation mode button is visible in the header');
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.dontSeeElementInDOM(SELECTOR_ANNOTATION_POINT_MARKER);

    I.say('Enter point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT);
    I.waitForVisible(SELECTOR_ANNOTATION_MODE);

    I.say('Place annotation');
    I.click(SELECTOR_PREVIEW);

    I.say('Pending annotation should be visible');
    I.waitForVisible(SELECTOR_ANNOTATION_POINT_MARKER);
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.waitForEnabled(SELECTOR_ANNOTATION_TEXTAREA);

    I.say('Add comment to annotation and save');
    I.fillField(SELECTOR_ANNOTATION_TEXTAREA, 'Sample Annotation');
    I.click(SELECTOR_ANNOTATION_BUTTON_POST);

    I.say('Annotation should be added to the dialog');
    I.seeNumberOfElements(SELECTOR_ANNOTATION_COMMENT, 1);

    I.say('Exit point annotation mode');
    I.click(SELECTOR_ANNOTATION_BUTTON_POINT_EXIT);
    I.waitForVisible(SELECTOR_ANNOTATION_BUTTON_POINT);

    // Wait a few seconds for the annotation to save on the server
    I.wait(1);
});

Scenario('Reply to an existing point annotation', (I) => {
    I.say('An annotation should be visible');
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.seeNumberOfElements(SELECTOR_ANNOTATION_POINT_MARKER, 1);

    I.say('Open the point annotation dialog');
    I.click(SELECTOR_ANNOTATION_POINT_MARKER);
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.seeNumberOfElements(SELECTOR_ANNOTATION_COMMENT, 1);

    I.say('Add comment to annotation and save');
    I.scrollTo(SELECTOR_REPLY_TEXTAREA);
    I.waitForEnabled(SELECTOR_REPLY_TEXTAREA);
    I.fillField(SELECTOR_REPLY_TEXTAREA, 'Sample Reply');
    I.scrollTo(SELECTOR_REPLY_CONTAINER);
    I.click(`${SELECTOR_REPLY_CONTAINER} ${SELECTOR_ANNOTATION_BUTTON_POST}`);

    I.say('Annotation should be added to the dialog');
    I.waitForValue(SELECTOR_REPLY_TEXTAREA, '');
    I.click(SELECTOR_ANNOTATION_POINT_MARKER);
    I.seeNumberOfElements(SELECTOR_ANNOTATION_COMMENT, 2);

    // Wait a few seconds for the annotation to save on the server
    I.wait(1);
});

Scenario('Delete reply to a point annotation', (I) => {
    I.say('An annotation should be visible');
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.seeNumberOfElements(SELECTOR_ANNOTATION_POINT_MARKER, 1);
    I.scrollTo(SELECTOR_ANNOTATION_POINT_MARKER);

    I.say('Open the point annotation dialog');
    I.click(SELECTOR_ANNOTATION_POINT_MARKER);
    I.seeNumberOfElements(SELECTOR_ANNOTATION_COMMENT, 2);

    I.say('Delete only one annotation');
    I.click(`${SELECTOR_ANNOTATION_COMMENT} ${SELECTOR_DELETE_COMMENT_BTN}`);

    I.say('Confirm deletion of the annotation');
    I.see('Delete this annotation?');
    I.click(SELECTOR_CONFIRM_DELETE_BTN);

    I.say('One annotation should be removed from the dialog');
    I.click(SELECTOR_ANNOTATION_POINT_MARKER);
    I.seeNumberOfElements(SELECTOR_ANNOTATION_COMMENT, 1);

    // Wait a few seconds for the annotation to save on the server
    I.wait(1);
});

Scenario('Delete the point annotation thread', (I) => {
    I.say('An annotation should be visible');
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);
    I.seeNumberOfElements(SELECTOR_ANNOTATION_POINT_MARKER, 1);
    I.scrollTo(SELECTOR_ANNOTATION_POINT_MARKER);

    I.say('Open the point annotation dialog');
    I.click(SELECTOR_ANNOTATION_POINT_MARKER);
    I.seeNumberOfElements(SELECTOR_ANNOTATION_COMMENT, 1);

    I.say('Delete the last annotation');
    I.click(`${SELECTOR_ANNOTATION_COMMENT} ${SELECTOR_DELETE_COMMENT_BTN}`);

    I.say('Confirm deletion of the annotation');
    I.see('Delete this annotation?');
    I.click(SELECTOR_CONFIRM_DELETE_BTN);
    I.dontSeeElementInDOM(SELECTOR_ANNOTATION_POINT_MARKER);
});
