export enum Mode {
    NONE = 'none',
    REGION = 'region',
}

export interface CommonState {
    mode: Mode;
    visibility: boolean;
}
export interface ModeState {
    current: Mode;
}

export const TOGGLE_ANNOTATION_MODE = 'TOGGLE_ANNOTATION_MODE';
export const TOGGLE_ANNOTATION_VISIBILITY = 'TOGGLE_ANNOTATION_VISIBILITY';

export interface ToggleAnnotationModeAction {
    type: typeof TOGGLE_ANNOTATION_MODE;
    payload: Mode;
}
