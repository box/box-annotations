import { AppState } from '../types';
import { SelectionItem } from './types';

type State = Pick<AppState, 'highlight'>;

export const getIsPromoting = (state: State): boolean => state.highlight.isPromoting;
export const getIsSelecting = (state: State): boolean => state.highlight.isSelecting;
export const getSelection = (state: State): SelectionItem | null => state.highlight.selection;
export const getSelectionForLocation = (state: State, location: number): SelectionItem | null => {
    const selection = getSelection(state);
    return selection && selection.location === location ? selection : null;
};
