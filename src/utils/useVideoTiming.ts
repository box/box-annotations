import { useState, useEffect } from "react";
import { TARGET_TYPE } from "../constants";
import { getVideoCurrentTimeInMilliseconds } from "./util";

export interface UseVideoTimingProps {
    targetType: typeof TARGET_TYPE.PAGE | typeof TARGET_TYPE.FRAME;
    referenceEl?: HTMLElement;
    activeAnnotationId: string | null;
    annotations: Array<{ id: string; target: { location: { value: number } } }>;
}

export interface UseVideoTimingReturnType {
    isVideoSeeking: boolean;
    targetVideoTime: number | null;
    getCurrentVideoLocation: () => number;
}

const useVideoTiming = ({
    targetType,
    referenceEl,
    activeAnnotationId,
    annotations,
}: UseVideoTimingProps): UseVideoTimingReturnType => {
    const [isVideoSeeking, setIsVideoSeeking] = useState<boolean>(false);
    const [targetVideoTime, setTargetVideoTime] = useState<number | null>(null);


    const getCurrentVideoTimeStamp = (): number => { 
         return getVideoCurrentTimeInMilliseconds(referenceEl as HTMLVideoElement);
    };

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
                const currentVideoTimePosition = getVideoCurrentTimeInMilliseconds(referenceEl as HTMLVideoElement);
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
    }, [targetType, referenceEl, isVideoSeeking, targetVideoTime]);

    // Set target video time when activeAnnotationId changes
    useEffect(() => {
        if (targetType === TARGET_TYPE.FRAME && activeAnnotationId && referenceEl) {
            const currentVideoTimePosition = getVideoCurrentTimeInMilliseconds(referenceEl as HTMLVideoElement);
            
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
    }, [activeAnnotationId, targetType, referenceEl, annotations]);

    return {
        isVideoSeeking,
        targetVideoTime,
        getCurrentVideoLocation: getCurrentVideoTimeStamp,
    };
};

export default useVideoTiming;

