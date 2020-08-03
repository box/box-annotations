import { Annotation, AnnotationHighlight } from '../@types';

export function isHighlight(annotation: Annotation): annotation is AnnotationHighlight {
    return annotation?.target?.type === 'highlight';
}
