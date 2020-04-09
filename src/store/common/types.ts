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
