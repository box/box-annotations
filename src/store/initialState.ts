import { ApplicationState } from './types';
import { initialState as commonState } from './common';
import { initialState as modeState } from './mode';

const initialState: ApplicationState = {
    common: commonState,
    mode: modeState,
};

export default initialState;
