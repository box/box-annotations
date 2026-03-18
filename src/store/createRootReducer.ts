import { combineReducers, Reducer } from 'redux';
import { annotationsReducer } from './annotations';
import { commonReducer } from './common';
import { creatorReducer } from './creator';
import { drawingReducer } from './drawing';
import { highlightReducer } from './highlight';
import { boundingBoxHighlightsReducer } from './boundingBoxHighlights';
import { optionsReducer } from './options';
import { usersReducer } from './users';

const createRootReducer = (): Reducer =>
    combineReducers({
        annotations: annotationsReducer,
        common: commonReducer,
        creator: creatorReducer,
        drawing: drawingReducer,
        highlight: highlightReducer,
        boundingBoxHighlights: boundingBoxHighlightsReducer,
        options: optionsReducer,
        users: usersReducer,
    });

export default createRootReducer;
