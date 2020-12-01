import { createAction } from '@reduxjs/toolkit';
import { PathGroup } from '../../@types';

export const addStagedPathGroupAction = createAction<PathGroup>('ADD_CREATOR_STAGED_PATHGROUP');
export const redoStagedPathGroupAction = createAction('REDO_CREATOR_STAGED_PATHGROUP');
export const undoStagedPathGroupAction = createAction('UNDO_CREATOR_STAGED_PATHGROUP');
