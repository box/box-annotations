export enum ModeTypes {
    NONE = 'none',
    REGION = 'region',
}

export const TOGGLE_ANNOTATION_MODE = 'TOGGLE_ANNOTATION_MODE';

export interface ToggleAnnotationModeAction {
    type: typeof TOGGLE_ANNOTATION_MODE;
    payload: ModeTypes;
}
