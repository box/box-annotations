import { combineReducers, Reducer } from 'redux';
import { annotationsReducer } from './annotations';
import { commonReducer } from './common';
import { creatorReducer } from './creator';
import { optionsReducer } from './options';

const createRootReducer = (): Reducer =>
    combineReducers({
        annotations: annotationsReducer,
        common: commonReducer,
        creator: creatorReducer,
        options: optionsReducer,
    });

export default createRootReducer;
