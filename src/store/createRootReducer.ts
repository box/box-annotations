import { combineReducers } from 'redux';
import modeReducer from './mode/reducer';

const createRootReducer = (): Function =>
    combineReducers({
        mode: modeReducer,
    });

export default createRootReducer;
