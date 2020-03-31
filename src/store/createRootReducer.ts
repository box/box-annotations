import { combineReducers, Reducer } from 'redux';
import modeReducer from './mode/reducer';

const createRootReducer = (): Reducer =>
    combineReducers({
        mode: modeReducer,
    });

export default createRootReducer;
