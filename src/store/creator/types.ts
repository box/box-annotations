import { Rect, SerializedError } from '../../@types';

export enum CreatorStatus {
    init = 'init',
    pending = 'pending',
    rejected = 'rejected',
    staged = 'staged',
    started = 'started',
}

export type CreatorRegion = {
    location: number;
    shape: Rect;
};

export type CreatorHighlight = {
    location: number;
    shapes: Rect[];
    text?: string;
};

export type CreatorItem = CreatorHighlight | CreatorRegion;

export type CreatorState = {
    cursor: number;
    error: SerializedError | null;
    message: string;
    staged: CreatorItem | null;
    status: CreatorStatus;
};
