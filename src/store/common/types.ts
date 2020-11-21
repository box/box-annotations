export enum Mode {
    DRAWING = 'drawing',
    HIGHLIGHT = 'highlight',
    NONE = 'none',
    REGION = 'region',
}

export interface CommonState {
    mode: Mode;
}
export interface ModeState {
    current: Mode;
}
