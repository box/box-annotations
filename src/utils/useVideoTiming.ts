import { useState, useEffect, useCallback } from "react";
import { TARGET_TYPE } from "../constants";



export interface UseVideoTimingProps {
    targetType: TARGET_TYPE;
    referenceEl?: HTMLElement;
    activeAnnotationId: string | null;
    annotations: Array<{ id: string; target: { location: { value: number } } }>;
}

export interface UseVideoTimingReturnType {
    isVideoSeeking: boolean;
    getCurrentVideoLocation: () => number;
}

export function getVideoCurrentTimeInMilliseconds(video: HTMLVideoElement): number {
    return (video?.currentTime ?? 0) * 1000;
}

/**
 * This hook is used to keep track of when the video is currently seeking and when it has reached
 * the target time definined in the annotation. This is necessary because we cannot control how long it
 * takes for the video to seek to the target time and we do not want to display an annotation on the video player 
 * at the wrong time. For example, if an annotation is defined at being at 20 seconds into the video and
 * the video just loaded and needs to buffer in order to get to 20 seconds, we do not want the annotation
 * drawing or region to be shown until the video has finished seeking and is at the correct time. The hook
 * works by listenting the video seeking, seeked, and timeupdate events and setting the isVideoSeeking state
 * based on these events. The hook will be used with both video drawing and video region annotations.
 */
const useVideoTiming = ({
    targetType,
    referenceEl,
    activeAnnotationId,
    annotations,
}: UseVideoTimingProps): UseVideoTimingReturnType => {
    const [isVideoSeeking, setIsVideoSeeking] = useState<boolean>(false);
    const [targetVideoTime, setTargetVideoTime] = useState<number | null>(null);


    const getCurrentVideoTimeStamp = useCallback((): number => { 
         return getVideoCurrentTimeInMilliseconds(referenceEl as HTMLVideoElement);
    }, [referenceEl]);

    // Handle video seeking events
    useEffect(() => {
        if (targetType !== TARGET_TYPE.FRAME || !referenceEl) {
            return undefined;
        }
        
        const handleSeeking = (): void => {
            setIsVideoSeeking(true);
        };

        const handleSeeked = (): void => {
            setIsVideoSeeking(false);
            setTargetVideoTime(null);
        };

        const handleTimeUpdate = (): void => {
            if (isVideoSeeking && targetVideoTime !== null) {
                const currentVideoTimePosition = getCurrentVideoTimeStamp();
                const timeDiff = Math.abs(currentVideoTimePosition - targetVideoTime);
                
                // Consider the video has reached the target time if within 100ms
                if (timeDiff <= 100) {
                    setIsVideoSeeking(false);
                    setTargetVideoTime(null);
                }
            }
        };

        referenceEl.addEventListener('seeking', handleSeeking);
        referenceEl.addEventListener('seeked', handleSeeked);
        referenceEl.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            referenceEl.removeEventListener('seeking', handleSeeking);
            referenceEl.removeEventListener('seeked', handleSeeked);
            referenceEl.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [targetType, referenceEl, isVideoSeeking, targetVideoTime, getCurrentVideoTimeStamp]);

    // Set target video time when activeAnnotationId changes
    useEffect(() => {
        if (targetType === TARGET_TYPE.FRAME && activeAnnotationId && referenceEl) {
            const currentVideoTimePosition = getCurrentVideoTimeStamp();
            
            // Find the annotation to get its target time
            const annotation = annotations.find(ann => ann.id === activeAnnotationId);
            if (annotation) {
                const annotationTimePosition = annotation.target.location.value;
                const timeDiff = Math.abs(currentVideoTimePosition - annotationTimePosition);
                
                // If the video is not at the annotation's time, set seeking state
                if (timeDiff > 100) {
                    setTargetVideoTime(annotationTimePosition);
                    setIsVideoSeeking(true);
                }
            }
        }
    }, [activeAnnotationId, targetType, referenceEl, annotations, getCurrentVideoTimeStamp]);

    return {
        isVideoSeeking,
        getCurrentVideoLocation: getCurrentVideoTimeStamp,
    };
};

export default useVideoTiming;

