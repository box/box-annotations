import React, { act } from 'react';
import { mount, ReactWrapper } from 'enzyme';
import useVideoTiming, { UseVideoTimingProps } from '../useVideoTiming';
import { TARGET_TYPE } from '../../constants';
import { getVideoCurrentTimeInMilliseconds } from '../util';
import { AnnotationDrawing } from '../../@types/model';

// Mock the utility function
jest.mock('../util', () => ({
    getVideoCurrentTimeInMilliseconds: jest.fn(),
}));

const mockGetVideoCurrentTimeInMilliseconds = getVideoCurrentTimeInMilliseconds as jest.MockedFunction<typeof getVideoCurrentTimeInMilliseconds>;

describe('useVideoTiming', () => {
    let mockVideoElement: HTMLVideoElement;
    let wrapper: ReactWrapper;

    const defaultProps = {
        targetType: TARGET_TYPE.FRAME,
        referenceEl: undefined,
        activeAnnotationId: null,
        annotations: [],
    };

    const getWrapper = ( props: UseVideoTimingProps) : ReactWrapper => {
        const TestComponent = (componentProps: UseVideoTimingProps): JSX.Element => {
           const result = useVideoTiming(componentProps);

            return (
                <div>
                    <div data-testid="isVideoSeeking">{result.isVideoSeeking.toString()}</div>
                    <div data-testid="currentVideoLocation">{result.getCurrentVideoLocation()}</div>
                </div>
            );
        };
        
        return mount(<TestComponent {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        // Create a mock video element
        mockVideoElement = document.createElement('video');
        mockVideoElement.currentTime = 0;
        
        // Mock the utility function to return 0 by default
        mockGetVideoCurrentTimeInMilliseconds.mockReturnValue(0);
        
        // Clear all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
    });

    describe('initial state', () => {
        test('should initialize with default values', () => {
            wrapper = getWrapper({
                targetType: TARGET_TYPE.FRAME,
                referenceEl: undefined,
                activeAnnotationId: null,
                annotations: []
            });
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('false');
            expect(wrapper.find('[data-testid="currentVideoLocation"]').text()).toBe('0');
        });

        test('should call getCurrentVideoLocation with reference element', () => {
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME,
                referenceEl: mockVideoElement,
                activeAnnotationId: null,
                annotations: []
            });
            
            expect(mockGetVideoCurrentTimeInMilliseconds).toHaveBeenCalledWith(mockVideoElement);
        });
    });

    describe('targetType handling', () => {
        test('should not set up event listeners when targetType is TARGET_TYPE.PAGE', () => {
            const addEventListenerSpy = jest.spyOn(mockVideoElement, 'addEventListener');
            
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.PAGE, 
                referenceEl: mockVideoElement,
                activeAnnotationId: null,
                annotations: []
            });
            
            expect(addEventListenerSpy).not.toHaveBeenCalled();
        });

        test('should set up event listeners when targetType is TARGET_TYPE.FRAME and referenceEl exists', () => {
            const addEventListenerSpy = jest.spyOn(mockVideoElement, 'addEventListener');
            
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME, 
                referenceEl: mockVideoElement,
                activeAnnotationId: null,
                annotations: []
            });
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('seeking', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('seeked', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('timeupdate', expect.any(Function));
        });

        test('should not set up event listeners when targetType is TARGET_TYPE.FRAME but no referenceEl', () => {
            const addEventListenerSpy = jest.spyOn(mockVideoElement, 'addEventListener');
            
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME, 
                referenceEl: undefined,
                activeAnnotationId: null,
                annotations: []
            });
            
            expect(addEventListenerSpy).not.toHaveBeenCalled();
        });
    });

    describe('video seeking events', () => {
        beforeEach(() => {
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME, 
                referenceEl: mockVideoElement,
                activeAnnotationId: null,
                annotations: []
            });
        });
     
        test('should set isVideoSeeking to true on seeking event', () => {          
               
            const seekingEvent = new Event('seeking');
            
            act(() => {
                mockVideoElement.dispatchEvent(seekingEvent);  
            });
            
            wrapper.update();
            
            const text = wrapper.find('[data-testid="isVideoSeeking"]').text();
            expect(text).toBe('true');
        });

        
        test('should set isVideoSeeking to false on seeked event', () => {
            // First set seeking state
            const seekingEvent = new Event('seeking');
            act(() => {
                mockVideoElement.dispatchEvent(seekingEvent);
            });
            wrapper.update();
                        
            // Then trigger seeked event
            const seekedEvent = new Event('seeked');
            act(() => {
                mockVideoElement.dispatchEvent(seekedEvent);
            });
            wrapper.update();
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('false');
        });
    });

    describe('timeupdate event handling', () => {
        beforeEach(() => {
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME, 
                referenceEl: mockVideoElement,
                activeAnnotationId: null,
                annotations: []
            });
        });

        test('should not change seeking state when not seeking', () => {
            mockGetVideoCurrentTimeInMilliseconds.mockReturnValue(5000);
            
            const timeUpdateEvent = new Event('timeupdate');
            act(() => {
            mockVideoElement.dispatchEvent(timeUpdateEvent);
            });
            
            wrapper.update();
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('false');
        });

        test('should not change seeking state when no target time is set', () => {
            // Set seeking state but no target time
            const seekingEvent = new Event('seeking');
            act(() => {
                mockVideoElement.dispatchEvent(seekingEvent);
            });
            wrapper.update();
            
            mockGetVideoCurrentTimeInMilliseconds.mockReturnValue(5000);
            
            const timeUpdateEvent = new Event('timeupdate');
            act(() => {
            mockVideoElement.dispatchEvent(timeUpdateEvent);    
            });
            wrapper.update();
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('true');
        });

        test('should stop seeking when within 100ms of target time', () => {
            const mockAnnotations = [
                { id: 'annotation1', target: { location: { value: 5000 } } },
            ];
            
            // Set up component with annotation that has target time of 5000ms
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME, 
                referenceEl: mockVideoElement,
                activeAnnotationId: 'annotation1',
                annotations: mockAnnotations
            });
            
            // Mock current time to be within 100ms of target (5000ms)
            mockGetVideoCurrentTimeInMilliseconds.mockReturnValue(4950);
            
            const timeUpdateEvent = new Event('timeupdate');
            act(() => {
            mockVideoElement.dispatchEvent(timeUpdateEvent);    
            });
            
            wrapper.update();
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('false');
        });

        test('should continue seeking when more than 100ms away from target time', () => {
            const mockAnnotations = [
                { id: 'annotation1', target: { location: { value: 5000 } } },
            ];
            
            // Set up component with annotation that has target time of 5000ms
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME, 
                referenceEl: mockVideoElement,
                activeAnnotationId: 'annotation1',
                annotations: mockAnnotations
            });
            
            // Mock current time to be more than 100ms away from target (5000ms)
            mockGetVideoCurrentTimeInMilliseconds.mockReturnValue(4800); // 200ms difference
            
            const timeUpdateEvent = new Event('timeupdate');
            act(() => {
                mockVideoElement.dispatchEvent(timeUpdateEvent);
            });
            wrapper.update();
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('true');
        });
    });

    describe('activeAnnotationId changes', () => {
        const mockAnnotations = [
            { id: 'annotation1', target: { location: { value: 3000 } } },
            { id: 'annotation2', target: { location: { value: 7000 } } },
        ];

  

        test('should not set seeking state when no activeAnnotationId', () => {
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME,
                referenceEl: mockVideoElement,
                activeAnnotationId: null,
                annotations: mockAnnotations
            });
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('false');
        });

        test('should not set seeking state when no referenceEl', () => {
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME,
                referenceEl: undefined,
                activeAnnotationId: 'annotation1',
                annotations: mockAnnotations
            });
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('false');
        });

        test('should not set seeking state when annotation not found', () => {
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME,
                referenceEl: mockVideoElement,
                activeAnnotationId: 'nonexistent',
                annotations: mockAnnotations
            });
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('false');
        });

        test('should set seeking state when video is more than 100ms away from annotation time', () => {
            mockGetVideoCurrentTimeInMilliseconds.mockReturnValue(1000); // Current time: 1000ms
            
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME,
                referenceEl: mockVideoElement,
                activeAnnotationId: 'annotation1',
                annotations: mockAnnotations // Target time: 3000ms
            });
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('true');
        });

        test('should not set seeking state when video is within 100ms of annotation time', () => {
            mockGetVideoCurrentTimeInMilliseconds.mockReturnValue(2950); // Current time: 2950ms (50ms from 3000ms)
            
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME,
                referenceEl: mockVideoElement,
                activeAnnotationId: 'annotation1',
                annotations: mockAnnotations // Target time: 3000ms
            });
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('false');
        });

        test('should update seeking state when activeAnnotationId changes', () => {
            mockGetVideoCurrentTimeInMilliseconds.mockReturnValue(1000); // Current time: 1000ms
            
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME,
                referenceEl: mockVideoElement,
                activeAnnotationId: 'annotation1',
                annotations: mockAnnotations // Target time: 3000ms
            });
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('true');
            
            // Change to annotation2 (target time: 7000ms)
            wrapper.setProps({ activeAnnotationId: 'annotation2' });
            wrapper.update();
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('true');
        });
    });

    describe('cleanup', () => {
        test('should remove event listeners on unmount', () => {
            const removeEventListenerSpy = jest.spyOn(mockVideoElement, 'removeEventListener');
            
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME, 
                referenceEl: mockVideoElement,
                activeAnnotationId: null,
                annotations: []
            });
            
            wrapper.unmount();
            
            expect(removeEventListenerSpy).toHaveBeenCalledWith('seeking', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('seeked', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('timeupdate', expect.any(Function));
        });

        test('should remove event listeners when referenceEl changes', () => {
            const removeEventListenerSpy = jest.spyOn(mockVideoElement, 'removeEventListener');
            
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME, 
                referenceEl: mockVideoElement,
                activeAnnotationId: null,
                annotations: []
            });
            
            // Change referenceEl to null
            wrapper.setProps({ referenceEl: null });
            wrapper.update();
            
            expect(removeEventListenerSpy).toHaveBeenCalledWith('seeking', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('seeked', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('timeupdate', expect.any(Function));
        });
    });

    describe('edge cases', () => {
        test('should handle empty annotations array', () => {
            const mockAnnotations = [] as unknown as AnnotationDrawing[];
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME,
                referenceEl: mockVideoElement,
                activeAnnotationId: 'annotation1',
                annotations: mockAnnotations
            });
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('false');
        });

        test('should handle annotation with zero time value', () => {
            const annotationsWithZeroTime = [
                { id: 'annotation1', target: { location: { value: 0 } } },
            ];
            
            mockGetVideoCurrentTimeInMilliseconds.mockReturnValue(200); 
            
            wrapper = getWrapper({ 
                targetType: TARGET_TYPE.FRAME,
                referenceEl: mockVideoElement,
                activeAnnotationId: 'annotation1',
                annotations: annotationsWithZeroTime
            });
            
            expect(wrapper.find('[data-testid="isVideoSeeking"]').text()).toBe('true');
        });


    });
});
