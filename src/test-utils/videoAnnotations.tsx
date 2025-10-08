import { ReactWrapper } from 'enzyme';
import { TARGET_TYPE } from '../constants';
import useVideoTiming from '../utils/useVideoTiming';
import { AnnotationDrawing, AnnotationRegion } from '../@types/model';

// Type alias for the list component wrapper
type ListComponentWrapper = ReactWrapper;

// Mock useVideoTiming hook
const mockUseVideoTiming = useVideoTiming as jest.MockedFunction<typeof useVideoTiming>;

const mockVideoTimingReturn = {
    isVideoSeeking: false,
    targetVideoTime: null,
    getCurrentVideoLocation: jest.fn(),
};

export interface VideoAnnotationTestConfig {
    componentName: string;
    getWrapper: (props: unknown) => ReactWrapper;
    findListComponent: (wrapper: ReactWrapper) => ListComponentWrapper;
    videoAnnotations: AnnotationDrawing[]|AnnotationRegion[] ;
    regularAnnotations: AnnotationDrawing[]|AnnotationRegion[];
    activeAnnotationId: string;
    nonExistentAnnotationId: string;
}

export const createVideoAnnotationTests = (config: VideoAnnotationTestConfig): void => {
    const {
        componentName,
        getWrapper,
        findListComponent,
        videoAnnotations,
        regularAnnotations,
        activeAnnotationId,
        nonExistentAnnotationId,
    } = config;

    beforeEach(() => {
        mockUseVideoTiming.mockReturnValue(mockVideoTimingReturn);
    });

    describe(`${componentName} video annotations`, () => {
        describe('TARGET_TYPE.FRAME target type', () => {
            test('should show only active annotation when not seeking and active annotation exists', () => {
                mockVideoTimingReturn.isVideoSeeking = false;
                
                const wrapper = getWrapper({
                    targetType: TARGET_TYPE.FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId,
                });

                const listComponent = findListComponent(wrapper);
                const annotations = listComponent.prop('annotations');
                expect(annotations).toHaveLength(1);
                expect((annotations as AnnotationDrawing[] | AnnotationRegion[])[0].id).toBe(activeAnnotationId);
            });

            test('should show no annotations when seeking and active annotation exists', () => {
                mockVideoTimingReturn.isVideoSeeking = true;
                
                const wrapper = getWrapper({
                    targetType: TARGET_TYPE.FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(0);
            });

            test('should show no annotations when not seeking but no active annotation', () => {
                mockVideoTimingReturn.isVideoSeeking = false;
                
                const wrapper = getWrapper({
                    targetType: TARGET_TYPE.FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId: null,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(0);
            });

            test('should show no annotations when seeking and no active annotation', () => {
                mockVideoTimingReturn.isVideoSeeking = true;
                
                const wrapper = getWrapper({
                    targetType: TARGET_TYPE.FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId: null,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(0);
            });

            test('should call useVideoTiming with correct parameters for TARGET_TYPE.FRAME type', () => {
                const referenceEl = document.createElement('video');
                
                getWrapper({
                    targetType: TARGET_TYPE.FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId,
                    referenceEl,
                });

                expect(mockUseVideoTiming).toHaveBeenCalledWith({
                    targetType: TARGET_TYPE.FRAME,
                    referenceEl,
                    activeAnnotationId,
                    annotations: videoAnnotations,
                });
            });
        });

        describe('useVideoTiming integration', () => {
            test('should call useVideoTiming hook on component mount', () => {
                const referenceEl = document.createElement('video');
                
                getWrapper({
                    targetType: TARGET_TYPE.FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId,
                    referenceEl,
                });

                expect(mockUseVideoTiming).toHaveBeenCalledTimes(1);
            });

            test('should pass correct parameters to useVideoTiming for TARGET_TYPE.PAGE type', () => {
                const referenceEl = document.createElement('div');
                
                getWrapper({
                    targetType: TARGET_TYPE.PAGE,
                    annotations: regularAnnotations,
                    activeAnnotationId,
                    referenceEl,
                });

                expect(mockUseVideoTiming).toHaveBeenCalledWith({
                    targetType: TARGET_TYPE.PAGE,
                    referenceEl,
                    activeAnnotationId,
                    annotations: regularAnnotations,
                });
            });
        });

        describe('annotation filtering edge cases', () => {
            test('should handle empty annotations array for TARGET_TYPE.FRAME type', () => {
                mockVideoTimingReturn.isVideoSeeking = false;
                
                const wrapper = getWrapper({
                    targetType: TARGET_TYPE.FRAME,
                    annotations: [],
                    activeAnnotationId: nonExistentAnnotationId,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(0);
            });

            test('should handle active annotation that does not exist in annotations array', () => {
                mockVideoTimingReturn.isVideoSeeking = false;
                
                const wrapper = getWrapper({
                    targetType: TARGET_TYPE.FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId: nonExistentAnnotationId,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(0);
            });
        });
    });
};
