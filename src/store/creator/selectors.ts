import { AppState } from '../types';
import { CreatorItem, CreatorItemHighlight, CreatorItemRegion, CreatorStatus } from './types';

type State = Pick<AppState, 'creator'>;

export const getCreatorCursor = (state: State): number => state.creator.cursor;
export const getCreatorMessage = (state: State): string => state.creator.message;
export const getCreatorReferenceId = (state: State): string | null => state.creator.referenceId;
export const getCreatorStaged = (state: State): CreatorItem | null => state.creator.staged;
export const getCreatorStagedForLocation = (state: State, location: number): CreatorItem | null => {
    const staged = getCreatorStaged(state);
    return staged && staged.location === location ? staged : null;
};
export const getCreatorStatus = (state: State): CreatorStatus => state.creator.status;

export const isCreatorStagedHighlight = (staged: CreatorItem | null): staged is CreatorItemHighlight => {
    return (staged as CreatorItemHighlight)?.shapes !== undefined;
};

export const isCreatorStagedRegion = (staged: CreatorItem | null): staged is CreatorItemRegion => {
    return (staged as CreatorItemRegion)?.shape !== undefined;
};
