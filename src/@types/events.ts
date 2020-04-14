enum Event {
    ANNOTATOR = 'annotatorevent', // Existing legacy event, don't rename
    CREATE_ANNOTATION = 'annotationcreate',
    ERROR = 'annotationerror', // Existing legacy event, don't rename
    SCALE = 'scaleannotations', // Existing legacy event, don't rename
    SELECT = 'annotationselect',
    SET_SELECTED = 'annotationsetselected',
    SET_VISIBILITY = 'annotationsetvisibility',
}

// eslint-disable-next-line import/prefer-default-export
export { Event };
