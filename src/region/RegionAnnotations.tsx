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

    return (
        <RegionList
            activeId={activeAnnotationId}
            annotations={annotations}
            className="ba-RegionAnnotations-list"
            onSelect={handleAnnotationActive}
        />
    );
};

export default RegionAnnotations;
