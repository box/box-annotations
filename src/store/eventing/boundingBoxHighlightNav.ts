import eventManager from '../../common/EventManager';
import { AppState } from '../types';
import { Event } from '../../@types';
import { getSelectedBoundingBoxHighlightId } from '../boundingBoxHighlights';

const handleNavigateBoundingBoxHighlight = (_prevState: AppState, nextState: AppState): void => {
    const highlightId = getSelectedBoundingBoxHighlightId(nextState);
    if (highlightId) {
        eventManager.emit(Event.BOUNDING_BOX_HIGHLIGHT_NAVIGATE, highlightId);
    }
};

export { handleNavigateBoundingBoxHighlight };
