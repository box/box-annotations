import { Annotation } from '../../@types';

export type AnnotationsState = {
    allIds: string[];
    byId: Record<string, Annotation>;
};
