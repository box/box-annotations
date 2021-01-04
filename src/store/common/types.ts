export enum Mode {
    DRAWING = 'drawing',
    HIGHLIGHT = 'highlight',
    NONE = 'none',
    REGION = 'region',
}

export interface CommonState {
    color: string;
    mode: Mode;
}
export interface ModeState {
    current: Mode;
}
