import createStore from './createStore';
import { isCreatorStagedHighlight, isCreatorStagedRegion } from '../creator/selectors';
import { Mode } from '../common/types';

module.exports = {
    createStore,
    getActiveAnnotationId: jest.fn(),
    getAnnotationMode: jest.fn(),
    getAnnotationsForLocation: jest.fn().mockReturnValue([]),
    getCreatorCursor: jest.fn().mockReturnValue(1),
    getCreatorMessage: jest.fn(),
    getCreatorStagedForLocation: jest.fn(),
    getCreatorStatus: jest.fn(),
    getFileId: jest.fn().mockReturnValue('0'),
    getIsCurrentFileVersion: jest.fn().mockReturnValue(true),
    getIsInitialized: jest.fn().mockReturnValue(false),
    getIsPromoting: jest.fn().mockReturnValue(false),
    getIsSelecting: jest.fn().mockReturnValue(false),
    getSelectionForLocation: jest.fn(),
    isCreatorStagedHighlight,
    isCreatorStagedRegion,
    Mode,
    setIsSelectingAction: jest.fn(arg => arg),
    setSelectionAction: jest.fn(arg => arg),
};
