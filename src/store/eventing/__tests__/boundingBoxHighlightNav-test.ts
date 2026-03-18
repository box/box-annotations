import eventManager from '../../../common/EventManager';
import { AppState } from '../../types';
import { Event } from '../../../@types';
import { getSelectedBoundingBoxHighlightId } from '../../boundingBoxHighlights';
import { handleNavigateBoundingBoxHighlight } from '../boundingBoxHighlightNav';

jest.mock('../../../common/EventManager');
jest.mock('../../boundingBoxHighlights');

describe('store/eventing/boundingBoxHighlightNav', () => {
    const mockState = {} as AppState;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should emit BOUNDING_BOX_HIGHLIGHT_NAVIGATE event when highlight id is set', () => {
        (getSelectedBoundingBoxHighlightId as jest.Mock).mockReturnValue('highlight-123');

        handleNavigateBoundingBoxHighlight(mockState, mockState);

        expect(eventManager.emit).toHaveBeenCalledWith(Event.BOUNDING_BOX_HIGHLIGHT_NAVIGATE, 'highlight-123');
    });

    test('should not emit event when highlight id is null', () => {
        (getSelectedBoundingBoxHighlightId as jest.Mock).mockReturnValue(null);

        handleNavigateBoundingBoxHighlight(mockState, mockState);

        expect(eventManager.emit).not.toHaveBeenCalled();
    });

    test('should use the nextState to get selected id', () => {
        const prevState = {} as AppState;
        const nextState = {} as AppState;
        (getSelectedBoundingBoxHighlightId as jest.Mock).mockReturnValue('highlight-456');

        handleNavigateBoundingBoxHighlight(prevState, nextState);

        expect(getSelectedBoundingBoxHighlightId).toHaveBeenCalledWith(nextState);
        expect(eventManager.emit).toHaveBeenCalledWith(Event.BOUNDING_BOX_HIGHLIGHT_NAVIGATE, 'highlight-456');
    });
});
