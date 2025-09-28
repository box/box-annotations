import { ReactWrapper } from 'enzyme';
import { FRAME, PAGE } from '../constants';
import useVideoTiming from '../utils/useVideoTiming';
import DrawingList from '../drawing/DrawingList';
import RegionList from '../region/RegionList';
import { AnnotationDrawing, AnnotationRegion } from '../@types/model';

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
    findListComponent: (wrapper: ReactWrapper) => ReactWrapper<typeof DrawingList|typeof RegionList>;
    videoAnnotations: AnnotationDrawing[]|AnnotationRegion[] ;
    regularAnnotations: AnnotationDrawing[]|AnnotationRegion[];
    activeAnnotationId: string;
    nonExistentAnnotationId: string;
}

export const createVideoAnnotationTests = (config: VideoAnnotationTestConfig) => {
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
        describe('FRAME target type', () => {
            test('should show only active annotation when not seeking and active annotation exists', () => {
                mockVideoTimingReturn.isVideoSeeking = false;
                
                const wrapper = getWrapper({
                    targetType: FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(1);
                expect(listComponent.prop('annotations')[0].id).toBe(activeAnnotationId);
            });

            test('should show no annotations when seeking and active annotation exists', () => {
                mockVideoTimingReturn.isVideoSeeking = true;
                
                const wrapper = getWrapper({
                    targetType: FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(0);
            });

            test('should show no annotations when not seeking but no active annotation', () => {
                mockVideoTimingReturn.isVideoSeeking = false;
                
                const wrapper = getWrapper({
                    targetType: FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId: null,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(0);
            });

            test('should show no annotations when seeking and no active annotation', () => {
                mockVideoTimingReturn.isVideoSeeking = true;
                
                const wrapper = getWrapper({
                    targetType: FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId: null,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(0);
            });

            test('should call useVideoTiming with correct parameters for FRAME type', () => {
                const referenceEl = document.createElement('video');
                
                getWrapper({
                    targetType: FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId,
                    referenceEl,
                });

                expect(mockUseVideoTiming).toHaveBeenCalledWith({
                    targetType: FRAME,
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
                    targetType: FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId,
                    referenceEl,
                });

                expect(mockUseVideoTiming).toHaveBeenCalledTimes(1);
            });

            test('should pass correct parameters to useVideoTiming for PAGE type', () => {
                const referenceEl = document.createElement('div');
                
                getWrapper({
                    targetType: PAGE,
                    annotations: regularAnnotations,
                    activeAnnotationId,
                    referenceEl,
                });

                expect(mockUseVideoTiming).toHaveBeenCalledWith({
                    targetType: PAGE,
                    referenceEl,
                    activeAnnotationId,
                    annotations: regularAnnotations,
                });
            });
        });

        describe('annotation filtering edge cases', () => {
            test('should handle empty annotations array for FRAME type', () => {
                mockVideoTimingReturn.isVideoSeeking = false;
                
                const wrapper = getWrapper({
                    targetType: FRAME,
                    annotations: [],
                    activeAnnotationId: nonExistentAnnotationId,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(0);
            });

            test('should handle active annotation that does not exist in annotations array', () => {
                mockVideoTimingReturn.isVideoSeeking = false;
                
                const wrapper = getWrapper({
                    targetType: FRAME,
                    annotations: videoAnnotations,
                    activeAnnotationId: nonExistentAnnotationId,
                });

                const listComponent = findListComponent(wrapper);
                expect(listComponent.prop('annotations')).toHaveLength(0);
            });
        });
    });
};
