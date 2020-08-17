import { combineReducers, Reducer } from 'redux';
import { annotationsReducer } from './annotations';
import { commonReducer } from './common';
import { creatorReducer } from './creator';
import { optionsReducer } from './options';
import { promoterReducer } from './promoter';
import { usersReducer } from './users';

const createRootReducer = (): Reducer =>
    combineReducers({
        annotations: annotationsReducer,
        common: commonReducer,
        creator: creatorReducer,
        options: optionsReducer,
        promoter: promoterReducer,
        users: usersReducer,
    });

export default createRootReducer;
