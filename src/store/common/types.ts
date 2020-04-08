export interface CommonState {
    visible: boolean;
}

export const TOGGLE_ANNOTATION_VISIBILITY = 'TOGGLE_ANNOTATION_VISIBILITY';

export interface ToggleAnnotationVisibilityAction {
    type: typeof TOGGLE_ANNOTATION_VISIBILITY;
}
