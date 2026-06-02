enum Event {
    // Inbound: emitted by the host; box-annotations listens.
    ACTIVE_SET = 'annotations_active_set',
    ANNOTATION_REMOVE = 'annotations_remove',
    BOUNDING_BOX_HIGHLIGHTS_SET = 'bounding_box_highlights_set',
    BOUNDING_BOX_HIGHLIGHT_SELECT = 'bounding_box_highlight_select',
    COLOR_SET = 'annotations_color_set',
    VIEW_MODE_SET = 'view_mode_set',
    VISIBLE_SET = 'annotations_visible_set',

    // Outbound: emitted by box-annotations; the host listens.
    ACTIVE_CHANGE = 'annotations_active_change',
    ANNOTATION_CREATE = 'annotations_create',
    ANNOTATION_DELETE = 'annotations_delete',
    ANNOTATION_FETCH_ERROR = 'annotations_fetch_error',
    ANNOTATION_REPLY_CREATE = 'annotations_reply_create',
    ANNOTATION_REPLY_DELETE = 'annotations_reply_delete',
    ANNOTATION_REPLY_UPDATE = 'annotations_reply_update',
    ANNOTATION_UPDATE = 'annotations_update',
    ANNOTATIONS_INITIALIZED = 'annotations_initialized',
    ANNOTATIONS_MODE_CHANGE = 'annotations_mode_change',
    CREATOR_STAGED_CHANGE = 'creator_staged_change',
    CREATOR_STATUS_CHANGE = 'creator_status_change',

    // Internal: box-annotations emits and listens to itself (redux state change → DOM side effect).
    BOUNDING_BOX_HIGHLIGHT_NAVIGATE = 'bounding_box_highlight_navigate',
}

enum SidebarEvent {
    SIDEBAR_ANNOTATION_UPDATE = 'sidebar.annotations_update',
    SIDEBAR_REPLY_CREATE = 'sidebar.annotations_reply_create',
    SIDEBAR_REPLY_DELETE = 'sidebar.annotations_reply_delete',
    SIDEBAR_REPLY_UPDATE = 'sidebar.annotations_reply_update',
}

// Existing legacy events, don't rename
enum LegacyEvent {
    ANNOTATOR = 'annotatorevent',
    ERROR = 'annotationerror',
    SCALE = 'scaleannotations',
}

export { Event, LegacyEvent, SidebarEvent };
