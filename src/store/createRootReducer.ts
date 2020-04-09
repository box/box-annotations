import { combineReducers, Reducer } from 'redux';
import { commonReducer } from './common';

const createRootReducer = (): Reducer =>
    combineReducers({
        common: commonReducer,
    });

export default createRootReducer;
