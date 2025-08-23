import * as React from 'react';
import RegionList from './RegionList';
import { AnnotationRegion } from '../@types';
import './RegionAnnotations.scss';

type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationRegion[];
    setActiveAnnotationId: (annotationId: string | null) => void;
};

const RegionAnnotations = (props: Props): JSX.Element => {
    const { activeAnnotationId, annotations, setActiveAnnotationId } = props;

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
    };

    let annotationsToShow = []
    if (annotations.length>0) {
        const {type} = annotations[0].target.location;
        if(type === 'frame') {
            annotationsToShow = annotations.filter(annotation => annotation.id === activeAnnotationId);
        } else {
            annotationsToShow = annotations;
        }
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
