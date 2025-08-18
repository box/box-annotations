import { Annotation } from '../../../@types';
import { AnnotationsState } from '../types';

export const annotationState: AnnotationsState = {
    activeId: null,
    allIds: ['test1', 'test2', 'test3'],
    byId: {
        test1: { id: 'test1', target: { location: { type: 'page' as const, value: 1 } } } as Annotation,
        test2: { id: 'test2', target: { location: { type: 'page' as const, value: 1 } } } as Annotation,
        test3: { id: 'test3', target: { location: { type: 'page' as const, value: 2 } } } as Annotation,
    },
    isInitialized: false,
};

export const videoAnnotationState: AnnotationsState = {
    activeId: null,
    allIds: ['testVid1', 'testVid2', 'testVid3'],
    byId: {
        testVid1: { id: 'testVid1', target: { location: { type: 'frame' as const, value: 100 } } } as Annotation,
        testVid2: { id: 'testVid2', target: { location: { type: 'frame' as const, value: 100 } } } as Annotation,
        testVid3: { id: 'testVid3', target: { location: { type: 'frame' as const, value: 20 } } } as Annotation,
    },
    isInitialized: false,
};


export default { annotationState, videoAnnotationState };