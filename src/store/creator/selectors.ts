import { AppState } from '../types';
import { CreatorItem, CreatorStatus, SelectionItem } from './types';

type State = Pick<AppState, 'creator'>;

export const getCreatorCursor = (state: State): number => state.creator.cursor;
export const getCreatorMessage = (state: State): string => state.creator.message;
export const getCreatorStaged = (state: State): CreatorItem | null => state.creator.staged;
export const getCreatorStagedForLocation = (state: State, location: number): CreatorItem | null => {
    const staged = getCreatorStaged(state);
    return staged && staged.location === location ? staged : null;
};
export const getCreatorStatus = (state: State): CreatorStatus => state.creator.status;
export const getSelection = (state: State): SelectionItem | null => state.creator.selection;
export const getSelectionForLocation = (state: State, location: number): SelectionItem | null => {
    const selection = getSelection(state);
    return selection && selection.location === location ? selection : null;
};
