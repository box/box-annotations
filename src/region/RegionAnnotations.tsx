import * as React from 'react';
import RegionList from './RegionList';
import { AnnotationRegion } from '../@types';
import './RegionAnnotations.scss';
import useVideoTiming from '../utils/useVideoTiming';
import { FRAME, PAGE } from '../constants';

type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    setActiveAnnotationId: (annotationId: string | null) => void;
    referenceEl: HTMLElement;
    targetType: typeof PAGE | typeof FRAME;
};

const RegionAnnotations = (props: Props): JSX.Element => {
    const { activeAnnotationId, annotations, setActiveAnnotationId, referenceEl, targetType } = props;
    const { isVideoSeeking } = useVideoTiming({
        targetType: FRAME,
        referenceEl: referenceEl as HTMLVideoElement,
        activeAnnotationId: activeAnnotationId || null,
        annotations: annotations || [],
    });

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
    };

    let annotationsToShow = []
  
    if (targetType === FRAME) {
        if (!isVideoSeeking && activeAnnotationId) {
            annotationsToShow = annotations.filter(annotation => annotation.id === activeAnnotationId);
        }
    } else {
        annotationsToShow = annotations;
    }
    

    return (
        <RegionList
            activeId={activeAnnotationId}
            annotations={annotationsToShow}
            className="ba-RegionAnnotations-list"
            onSelect={handleAnnotationActive}
        />
    );
};

export default RegionAnnotations;
