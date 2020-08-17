import { AppState } from '../types';
import { SelectionItem } from './types';

type State = Pick<AppState, 'promoter'>;

export const getSelection = (state: State): SelectionItem | null => state.promoter.selection;
export const getSelectionForLocation = (state: State, location: number): SelectionItem | null => {
    const selection = getSelection(state);
    return selection && selection.location === location ? selection : null;
};
