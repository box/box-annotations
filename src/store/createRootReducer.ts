import { combineReducers, Reducer } from 'redux';
import { modeReducer } from './mode';

const createRootReducer = (): Reducer =>
    combineReducers({
        mode: modeReducer,
    });

export default createRootReducer;
