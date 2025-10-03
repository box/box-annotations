import { createDrawingAction, CreateArg, setupDrawingAction } from '../actions';
import { createAnnotationAction } from '../../store/annotations';
import { pathGroups } from '../__mocks__/drawingData';
import { resetDrawingAction, setDrawingLocationAction } from '../../store/drawing';

// Test-specific type for target types to avoid importing application constants
type TestTargetType = 'page' | 'frame';

// Mock the dependencies
jest.mock('../../store/annotations', () => ({
    createAnnotationAction: Object.assign(jest.fn(), {
        type: 'CREATE_ANNOTATION',
        pending: { type: 'CREATE_ANNOTATION/pending' },
        fulfilled: { type: 'CREATE_ANNOTATION/fulfilled' },
        rejected: { type: 'CREATE_ANNOTATION/rejected' },
    }),
}));

jest.mock('../../store/drawing', () => ({
    resetDrawingAction: jest.fn(),
    setDrawingLocationAction: jest.fn(),
}));

const mockCreateAnnotationAction = createAnnotationAction as jest.MockedFunction<typeof createAnnotationAction>;
const mockResetDrawingAction = resetDrawingAction as jest.MockedFunction<typeof resetDrawingAction>;
const mockSetDrawingLocationAction = setDrawingLocationAction as jest.MockedFunction<typeof setDrawingLocationAction>;
const getCreateArg = (overrides: Partial<CreateArg> = {}): CreateArg => ({
    location: 100,
    message: 'Test drawing annotation',
    pathGroups,
    targetType: 'page' as TestTargetType as CreateArg['targetType'],
    ...overrides,
});

describe('drawing/actions', () => {
    const mockDispatch = jest.fn();
    const mockGetState = jest.fn().mockReturnValue({
        options: {
            fileVersionId: 'file-version-123',
        },
    });


    beforeEach(() => {
        mockCreateAnnotationAction.mockReturnValue({ type: 'CREATE_ANNOTATION' } as unknown as ReturnType<typeof createAnnotationAction>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createDrawingAction', () => {
  
        test('should create annotation with page target type', () => {
            const arg = getCreateArg({ targetType: 'page' as TestTargetType as CreateArg['targetType'] });
            const action = createDrawingAction(arg);
            
            action(mockDispatch, mockGetState);

            expect(mockCreateAnnotationAction).toHaveBeenCalledWith({
                description: {
                    message: 'Test drawing annotation',
                    type: 'reply',
                },
                file_version: {
                    id: 'file-version-123',
                },
                target: {
                    location: {
                        type: 'page',
                        value: 100,
                    },
                    path_groups: pathGroups,
                    type: 'drawing',
                },
            });
        });

        test('should create annotation with frame target type', () => {
            const arg = getCreateArg({ targetType: 'frame' as TestTargetType as CreateArg['targetType'] });
            const action = createDrawingAction(arg);
            
            action(mockDispatch, mockGetState);

            expect(mockCreateAnnotationAction).toHaveBeenCalledWith({
                description: {
                    message: 'Test drawing annotation',
                    type: 'reply',
                },
                file_version: {
                    id: 'file-version-123',
                },
                target: {
                    location: {
                        type: 'frame',
                        value: 100,
                    },
                    path_groups: pathGroups,
                    type: 'drawing',
                },
            });
        });


        test('should dispatch createAnnotationAction', () => {
            const arg = getCreateArg();
            const action = createDrawingAction(arg);
            action(mockDispatch, mockGetState);
            expect(mockDispatch).toHaveBeenCalledTimes(1);
        });
    });

    describe('setupDrawingAction', () => {
        beforeEach(() => {
            mockResetDrawingAction.mockReturnValue({ type: 'RESET_DRAWING' } as unknown as ReturnType<typeof resetDrawingAction>);
        });
        afterEach(() => {
            jest.clearAllMocks();
        });

        test('should dispatch resetDrawingAction if creator status is staged', () => {
            mockGetState.mockReturnValue({
                creator: {
                    status: 'staged',
                },
            });
            const action = setupDrawingAction(100);
            action(mockDispatch, mockGetState);
            expect(mockResetDrawingAction).toHaveBeenCalledTimes(1);
            expect(mockSetDrawingLocationAction).toHaveBeenCalledTimes(1);
            expect(mockSetDrawingLocationAction).toHaveBeenCalledWith(100);
            expect(mockDispatch).toHaveBeenCalledTimes(2);
        });

        test('should not dispatch resetDrawingAction if creator status is not staged', () => {
            mockGetState.mockReturnValue({
                creator: {
                    status: 'init',
                },
            });
            const action = setupDrawingAction(100);
            action(mockDispatch, mockGetState);
            expect(mockResetDrawingAction).not.toHaveBeenCalled();
            expect(mockSetDrawingLocationAction).toHaveBeenCalledTimes(1);
            expect(mockSetDrawingLocationAction).toHaveBeenCalledWith(100);
            expect(mockDispatch).toHaveBeenCalledTimes(1);
        }); 

    });
});
