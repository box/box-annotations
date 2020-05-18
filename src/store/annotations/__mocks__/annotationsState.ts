import { Annotation } from '../../../@types';
import { AnnotationsState } from '../types';

const annotationState: AnnotationsState = {
    activeId: null,
    allIds: ['test1', 'test2', 'test3'],
    byId: {
        test1: { id: 'test1', target: { location: { value: 1 } } } as Annotation,
        test2: { id: 'test2', target: { location: { value: 1 } } } as Annotation,
        test3: { id: 'test3', target: { location: { value: 2 } } } as Annotation,
    },
};

export default annotationState;
