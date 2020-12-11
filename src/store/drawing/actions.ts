import { createAction } from '@reduxjs/toolkit';
import { addClientIds } from '../../drawing/drawingUtil';

export const addDrawingPathGroupAction = createAction('ADD_DRAWING_PATH_GROUP', pathGroup => ({
    payload: addClientIds(pathGroup),
}));
export const redoDrawingPathGroupAction = createAction('REDO_DRAWING_PATH_GROUP');
export const resetDrawingAction = createAction('RESET_DRAWING');
export const setDrawingLocationAction = createAction<number>('SET_DRAWING_LOCATION');
export const undoDrawingPathGroupAction = createAction('UNDO_DRAWING_PATH_GROUP');
