import { defineMessages } from 'react-intl';

export default defineMessages({
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
    annotationsCreateError: {
        id: 'ba.annotationsCreateError',
        description: 'Error message when creating',
        defaultMessage: 'We’re sorry, the annotation could not be created.',
    },
    annotationsLoadError: {
        id: 'ba.annotationsLoadError',
        description: 'Error message when loading',
        defaultMessage: 'We’re sorry, the annotations failed to load for this file.',
    },
});
