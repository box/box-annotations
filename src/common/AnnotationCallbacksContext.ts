import { createContext } from 'react';

export type AnnotationCallbacks = {
    onCopyLink?: (params: { annotationId: string; fileVersionId: string }) => void;
};

export default createContext<AnnotationCallbacks>({});
