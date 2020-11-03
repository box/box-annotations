enum Event {
    ACTIVE_CHANGE = 'annotations_active_change',
    ACTIVE_SET = 'annotations_active_set',
    CREATOR_STAGED_CHANGE = 'creator_staged_change',
    CREATOR_STATUS_CHANGE = 'creator_status_change',
    ANNOTATION_CREATE = 'annotations_create',
    ANNOTATIONS_DOCUMENT_EXPLICIT_CREATE_TOGGLED = 'annotations_document_explicit_create_toggled',
    ANNOTATIONS_IMAGE_EXPLICIT_CREATE_TOGGLED = 'annotations_image_explicit_create_toggled',
    ANNOTATION_FETCH_ERROR = 'annotations_fetch_error',
    ANNOTATION_REMOVE = 'annotations_remove',
    ANNOTATIONS_INITIALIZED = 'annotations_initialized',
    ANNOTATIONS_MODE_CHANGE = 'annotations_mode_change',
    VISIBLE_SET = 'annotations_visible_set',
}

// Existing legacy events, don't rename
enum LegacyEvent {
    ANNOTATOR = 'annotatorevent',
    ERROR = 'annotationerror',
    SCALE = 'scaleannotations',
}

export { Event, LegacyEvent };
