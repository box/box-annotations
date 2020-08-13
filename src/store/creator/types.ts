import { SerializedError, AnnotationHighlight, AnnotationRegion } from '../../@types';

export enum CreatorStatus {
    init = 'init',
    pending = 'pending',
    rejected = 'rejected',
    staged = 'staged',
    started = 'started',
}

export type CreatorRegion = Pick<AnnotationRegion, 'target'>;

export type CreatorHighlight = Pick<AnnotationHighlight, 'target'>;

export type CreatorItem = CreatorRegion | CreatorHighlight;

export type CreatorState = {
    cursor: number;
    error: SerializedError | null;
    message: string;
    staged: CreatorItem | null;
    status: CreatorStatus;
};
