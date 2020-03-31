export const NONE = 'none';
export const REGION = 'region';

export type ModeTypes = typeof NONE | typeof REGION;

export type ModeState = ModeTypes;

export const TOGGLE_ANNOTATION_MODE = 'TOGGLE_ANNOTATION_MODE';

export interface ToggleAnnotationModeAction {
    type: typeof TOGGLE_ANNOTATION_MODE;
    payload: ModeTypes;
}
