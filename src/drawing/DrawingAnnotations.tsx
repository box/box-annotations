import * as React from 'react';
import DrawingList from './DrawingList';
import { AnnotationDrawing } from '../@types';
import './DrawingAnnotations.scss';

export type Props = {
    activeAnnotationId: string | null;
    annotations: AnnotationDrawing[];
    isCurrentFileVersion: boolean;
    setActiveAnnotationId: (annotationId: string | null) => void;
};

const DrawingAnnotations = (props: Props): JSX.Element => {
    const { activeAnnotationId, annotations, isCurrentFileVersion, setActiveAnnotationId } = props;

    const handleAnnotationActive = (annotationId: string | null): void => {
        setActiveAnnotationId(annotationId);
    };

    return (
        <DrawingList
            activeId={activeAnnotationId}
            annotations={annotations}
            className="ba-DrawingAnnotations-list"
            data-resin-iscurrent={isCurrentFileVersion}
            onSelect={handleAnnotationActive}
        />
    );
};

export default DrawingAnnotations;
