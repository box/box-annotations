import { Annotation } from '../../@types';

export type AnnotationsState = {
    activeAnnotationId: string | null;
    allIds: string[];
    byId: Record<string, Annotation>;
};
