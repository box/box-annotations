import { combineReducers, Reducer } from 'redux';
import { commonReducer } from './common';
import { modeReducer } from './mode';

const createRootReducer = (): Reducer =>
    combineReducers({
        common: commonReducer,
        mode: modeReducer,
    });

export default createRootReducer;
