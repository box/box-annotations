import { defineMessages } from 'react-intl';

export default defineMessages({
    anonymousUser: {
        id: 'ba.anonymousUser',
        description: 'Place holder for the anonymous user',
        defaultMessage: 'Some User',
    },
    annotationsCancel: {
        id: 'ba.annotationsCancel',
        description: 'Label for the Cancel button',
        defaultMessage: 'Cancel',
    },
    annotationsClose: {
        id: 'ba.annotationsClose',
        description: 'Label for the close button',
        defaultMessage: 'Close',
    },
    annotationsDone: {
        id: 'ba.annotationsDone',
        description: 'Label for the Done button',
        defaultMessage: 'Done',
    },
    annotationsSave: {
        id: 'ba.annotationsSave',
        description: 'Label for the save button',
        defaultMessage: 'Save',
    },
    annotationsPost: {
        id: 'ba.annotationsPost',
        description: 'Label for the post button',
        defaultMessage: 'Post',
    },
    annotationDrawToggle: {
        id: 'ba.annotationDrawToggle',
        description: 'Accessibility message for button that toggles drawing annotation mode ',
        defaultMessage: 'Drawing annotation mode',
    },
    annotationHighlightToggle: {
        id: 'ba.annotationHighlightToggle',
        description: 'Accessibility message for button that toggles highlight annotation mode ',
        defaultMessage: 'Highlight text',
    },
    annotationPointToggle: {
        id: 'ba.annotationPointToggle',
        description: 'Accessibility message for button that toggles point annotation mode ',
        defaultMessage: 'Point annotation mode',
    },
    annotationsAuthError: {
        id: 'ba.annotationsAuthError',
        description: 'Error message when Authorizing',
        defaultMessage: 'Your session has expired. Please refresh the page',
    },
    annotationsLoadError: {
        id: 'ba.annotationsLoadError',
        description: 'Error message when loading',
        defaultMessage: 'We’re sorry, annotations failed to load for this file',
    },
    annotationsCreateError: {
        id: 'ba.annotationsCreateError',
        description: 'Error message when creating',
        defaultMessage: 'We’re sorry, the annotation could not be created.',
    },
    annotationsDeleteError: {
        id: 'ba.annotationsDeleteError',
        description: 'Error message when deleting an annotation',
        defaultMessage: 'We’re sorry, the annotation could not be deleted.',
    },
});
