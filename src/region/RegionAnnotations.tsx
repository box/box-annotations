import * as React from 'react';
import RegionList from './RegionList';
import { AnnotationRegion } from '../@types';
import './RegionAnnotations.scss';
import useVideoTiming from '../utils/useVideoTiming';
import { TARGET_TYPE } from '../constants';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    setActiveAnnotationId: (annotationId: string | null) => void;
    referenceEl?: HTMLElement;
    targetType: TARGET_TYPE;
};

const RegionAnnotations = (props: Props): JSX.Element => {
    const { activeAnnotationId, annotations, setActiveAnnotationId, referenceEl, targetType } = props;
    const { isVideoSeeking } = useVideoTiming({
        targetType,
        referenceEl,
        activeAnnotationId: activeAnnotationId || null,
        annotations: annotations || [],
    });

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
    };

    let annotationsToShow: AnnotationRegion[] = []
  
    if (targetType === TARGET_TYPE.FRAME) {
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
