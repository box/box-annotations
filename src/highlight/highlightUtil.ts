import { Annotation, AnnotationHighlight, Type } from '../@types';

export function isHighlight(annotation: Annotation): annotation is AnnotationHighlight {
    return annotation?.target?.type === Type.highlight;
}
