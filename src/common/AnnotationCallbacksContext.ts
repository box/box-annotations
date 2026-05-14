import { createContext } from 'react';

export type AnnotationCallbacks = {
    onCopyLink?: (id: string) => void;
};

export default createContext<AnnotationCallbacks>({});
