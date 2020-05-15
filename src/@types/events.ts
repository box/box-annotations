enum Event {
    ANNOTATION_CREATE = 'annotations_create',
    ANNOTATION_DELETE = 'annotations_delete',
    ACTIVE_CHANGE = 'annotations_active_change',
    ACTIVE_SET = 'annotations_active_set',
    VISIBLE_SET = 'annotations_visible_set',
}

// Existing legacy events, don't rename
enum LegacyEvent {
    ANNOTATOR = 'annotatorevent',
    ERROR = 'annotationerror',
    SCALE = 'scaleannotations',
}

export { Event, LegacyEvent };
