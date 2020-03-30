import { defineMessages } from 'react-intl';

export default defineMessages({
    anonymousUser: {
        id: 'ba.anonymousUser',
        description: 'Place holder for the anonymous user',
        defaultMessage: 'Some User',
    },
    annotationsClose: {
        id: 'ba.annotationsClose',
        description: 'Label for the close button',
        defaultMessage: 'Close',
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
    annotationHighlightToggle: {
        id: 'ba.annotationHighlightToggle',
        description: 'Accessibility message for button that toggles highlight annotation mode ',
        defaultMessage: 'Highlight text',
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
