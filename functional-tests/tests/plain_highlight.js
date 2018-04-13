const {
    SELECTOR_ANNOTATIONS_LOADED,
    SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG,
    SELECTOR_ANNOTATION_DIALOG,
    SELECTOR_ADD_HIGHLIGHT_BTN,
    SELECTOR_HIGHLIGHT_LABEL
} = require('../helpers/constants');

const { selectText } = require('../helpers/mouseEvents');

Feature('Plain Highlight Annotation Sanity');

Before((I) => {
    I.amOnPage('/');
});

Scenario('Create a new plain highlight annotation @desktop @enabled', (I) => {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    I.say('Highlight dialog should appear after selecting text');
    selectText(I, '.textLayer');
    I.waitForVisible(SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);

    I.say('Highlight selected text');
    I.click(SELECTOR_ADD_HIGHLIGHT_BTN);

    I.say('Highlight should be created and dialog should appear');
    I.waitForVisible(SELECTOR_ANNOTATION_DIALOG);
    I.waitForText('Kanye West highlighted', 5, SELECTOR_HIGHLIGHT_LABEL);
    I.waitForEnabled(SELECTOR_ADD_HIGHLIGHT_BTN);
});

Scenario('Delete the plain highlight annotation @desktop @enabled', (I) => {
    I.waitForVisible(SELECTOR_ANNOTATIONS_LOADED);

    I.say('Highlight dialog should appear on click');
    I.click('.textLayer div');
    I.waitForVisible(SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG);

    I.say('Delete the highlight annotation');
    I.click(SELECTOR_ADD_HIGHLIGHT_BTN);

    I.say('Highlight should be deleted');
    I.waitForDetached(SELECTOR_ANNOTATION_DIALOG, 5);
});
