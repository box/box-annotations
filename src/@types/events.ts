enum Event {
    ACTIVE_CHANGE = 'annotations_active_change',
    ACTIVE_SET = 'annotations_active_set',
    ANNOTATION_CREATE = 'annotations_create',
    ANNOTATION_FETCH_ERROR = 'annotations_fetch_error',
    ANNOTATION_REMOVE = 'annotations_remove',
    ANNOTATIONS_INITIALIZED = 'annotations_initialized',
    ANNOTATIONS_MODE_CHANGE = 'annotations_mode_change',
    ANNOTATIONS_STAGED_CHANGE = 'annotations_staged_change',
    VISIBLE_SET = 'annotations_visible_set',
}

// Existing legacy events, don't rename
enum LegacyEvent {
    ANNOTATOR = 'annotatorevent',
    ERROR = 'annotationerror',
    SCALE = 'scaleannotations',
}

export { Event, LegacyEvent };
