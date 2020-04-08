import { CommonState } from './common';
import { ModeState } from './mode';

export interface ApplicationState {
    common: CommonState;
    mode: ModeState;
}
