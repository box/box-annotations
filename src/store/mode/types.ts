export enum Mode {
    NONE = 'none',
    REGION = 'region',
}

export interface ModeState {
    current: Mode;
}

export const TOGGLE_ANNOTATION_MODE = 'TOGGLE_ANNOTATION_MODE';

export interface ToggleAnnotationModeAction {
    type: typeof TOGGLE_ANNOTATION_MODE;
    payload: Mode;
}
