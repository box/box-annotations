import { AnnotationsState } from './annotations';
import { CommonState } from './common';
import { CreatorState } from './creator';

export interface ApplicationState {
    annotations: AnnotationsState;
    creator: CreatorState;
    common: CommonState;
}
