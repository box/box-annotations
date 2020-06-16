import { Annotation } from '../../@types';

export type AnnotationsState = {
    activeId: string | null;
    allIds: string[];
    byId: Record<string, Annotation>;
    isInitialized: boolean;
};
