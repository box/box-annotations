import { combineReducers, Reducer } from 'redux';
import { annotationsReducer } from './annotations';
import { commonReducer } from './common';
import { creatorReducer } from './creator';
import { highlightReducer } from './highlight';
import { optionsReducer } from './options';
import { usersReducer } from './users';

const createRootReducer = (): Reducer =>
    combineReducers({
        annotations: annotationsReducer,
        common: commonReducer,
        creator: creatorReducer,
        highlight: highlightReducer,
        options: optionsReducer,
        users: usersReducer,
    });

export default createRootReducer;
