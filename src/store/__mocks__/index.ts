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
    getIsInitialized: jest.fn().mockReturnValue(false),
    getIsCurrentFileVersion: jest.fn().mockReturnValue(true),
    isCreatorStagedHighlight,
    isCreatorStagedRegion,
    setSelectionAction: jest.fn(arg => arg),
    Mode,
};
