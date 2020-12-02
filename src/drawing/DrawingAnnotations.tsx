import * as React from 'react';
import DrawingList from './DrawingList';
import { AnnotationDrawing } from '../@types';
import './DrawingAnnotations.scss';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationDrawing[];
    setActiveAnnotationId: (annotationId: string | null) => void;
};

const DrawingAnnotations = (props: Props): JSX.Element => {
    const { activeAnnotationId, annotations, setActiveAnnotationId } = props;

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
    };

    return (
        <DrawingList
            activeId={activeAnnotationId}
            annotations={annotations}
            className="ba-DrawingAnnotations-list"
            onSelect={handleAnnotationActive}
        />
    );
};

export default DrawingAnnotations;
