import { AppState } from '../types';
import { MEDIA_LOCATION_INDEX } from '../../constants';
import { CreatorItem, CreatorItemDrawing, CreatorItemHighlight, CreatorItemRegion, CreatorStatus } from './types';

type State = Pick<AppState, 'creator'>;

export const getCreatorCursor = (state: State): number => state.creator.cursor;
export const getCreatorMessage = (state: State): string => state.creator.message;
export const getCreatorReferenceId = (state: State): string | null => state.creator.referenceId;
export const getCreatorStaged = (state: State): CreatorItem | null => state.creator.staged;
export const getCreatorStagedForLocation = (state: State, location: number): CreatorItem | null => {
    const staged = getCreatorStaged(state);
    // The location is typically a page and this selector was originally meant to only return the staged annotation
    // (those that have been drawn but not saved) that belong to the page specified by the location. For documents, 
    // the annotator creates new sets of managers(highlights, drawings, regions) for each page with the current 
    // page number being the location e.g. page 4 of 10. This selector prevents a staged annotation from staying on 
    // the screen when a user navigates to a different page. By default, the location value for managers is 1 which is  
    // why this selector works for images. Video annotations will not work this way because they reference a timestamp, not a page,
    // and the drawing canvas is the video player which has no pages. In this case, we just need to get the staged annotation and do the 
    // locaton check for MEDIA_LOCATION_INDEX. The MEDIA_LOCATION_INDEX is a special value, set in the manager, that is used to indicate that 
    // the this is actually a staged video annotation with a timestamp as its location.
    if (location === MEDIA_LOCATION_INDEX) {
        return staged;
    }
    return staged && staged.location === location ? staged : null;
};
export const getCreatorStatus = (state: State): CreatorStatus => state.creator.status;

export const isCreatorStagedDrawing = (staged: CreatorItem | null): staged is CreatorItemDrawing =>
    (staged as CreatorItemDrawing)?.pathGroups !== undefined;
export const isCreatorStagedHighlight = (staged: CreatorItem | null): staged is CreatorItemHighlight =>
    (staged as CreatorItemHighlight)?.shapes !== undefined;
export const isCreatorStagedRegion = (staged: CreatorItem | null): staged is CreatorItemRegion =>
    (staged as CreatorItemRegion)?.shape !== undefined;
