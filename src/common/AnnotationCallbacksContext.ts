import { createContext } from 'react';

export type AnnotationCallbacks = {
    onCopyLink?: (annotationId: string, fileVersionId: string) => void;
};

export default createContext<AnnotationCallbacks>({});
