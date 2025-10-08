import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import RegionAnnotations, { Props } from '../RegionAnnotations';
import RegionList from '../RegionList';
import { annotations, videoAnnotations } from '../__mocks__/data';
import { TARGET_TYPE } from '../../constants';
import useVideoTiming from '../../utils/useVideoTiming';
import { createVideoAnnotationTests } from '../../test-utils/videoAnnotations';
import { AnnotationRegion } from '../../@types/model';

jest.mock('../RegionList');
jest.mock('../../utils/useVideoTiming', () => jest.fn());

// Mock useVideoTiming hook
const mockUseVideoTiming = useVideoTiming as jest.MockedFunction<typeof useVideoTiming>;

const mockVideoTimingReturn = {
    isVideoSeeking: false,
    targetVideoTime: null,
    getCurrentVideoLocation: jest.fn(),
};

describe('RegionAnnotations', () => {

    beforeEach(() => {
        mockUseVideoTiming.mockReturnValue(mockVideoTimingReturn);
    });

    const getDefaults = (): Props => ({
        activeAnnotationId: null,
        annotations: [],
        setActiveAnnotationId: jest.fn(),
        referenceEl: document.createElement('div'),
        targetType: TARGET_TYPE.PAGE,
    });
    const getWrapper = (props = {}): ReactWrapper => mount(<RegionAnnotations {...getDefaults()} {...props} />);



    describe('event handlers', () => {
        describe('handleAnnotationActive()', () => {
            test('should call setActiveAnnotationId with annotation id', () => {
                const setActiveAnnotationId = jest.fn();
                getWrapper({ setActiveAnnotationId })
                    .find(RegionList)
                    .prop('onSelect')!('123');

                expect(setActiveAnnotationId).toHaveBeenCalledWith('123');
            });
        });
    });

    describe('render()', () => {
        test('should render one RegionAnnotation per annotation', () => {
            const wrapper = getWrapper({ annotations });
            const list = wrapper.find(RegionList);

            expect(list.hasClass('ba-RegionAnnotations-list')).toBe(true);
            expect(list.prop('annotations').length).toBe(annotations.length);
        });

        test('should pass activeId to the region list', () => {
            const wrapper = getWrapper({ activeAnnotationId: '123' });

            expect(wrapper.find(RegionList).prop('activeId')).toBe('123');
        });
    });

    // Use shared video annotation tests
    createVideoAnnotationTests({
        componentName: 'RegionAnnotations',
        getWrapper,
        findListComponent: (wrapper) => wrapper.find(RegionList),
        videoAnnotations: videoAnnotations as AnnotationRegion[],
        regularAnnotations: annotations as AnnotationRegion[],
        activeAnnotationId: 'video_region_anno_2',
        nonExistentAnnotationId: 'non_existent_annotation_id',
    });

    // Region-specific video annotation tests
    describe('region-specific video annotation tests', () => {
        test('should filter to show only the matching active annotation', () => {
            mockVideoTimingReturn.isVideoSeeking = false;
            const activeAnnotationId = 'video_region_anno_3';
            
            const wrapper = getWrapper({
                targetType: TARGET_TYPE.FRAME,
                annotations: videoAnnotations,
                activeAnnotationId,
            });

            const regionList = wrapper.find(RegionList);
            expect(regionList.prop('annotations')).toHaveLength(1);
            expect(regionList.prop('annotations')[0].id).toBe(activeAnnotationId);
            expect(regionList.prop('annotations')[0].target.location.value).toBe(30000);
        });
    });
});
