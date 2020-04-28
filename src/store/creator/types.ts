import { Rect, SerializedError } from '../../@types';

export enum CreatorStatus {
    init = 'init',
    pending = 'pending',
    rejected = 'rejected',
    staged = 'staged',
}

export type CreatorItem = {
    location: number;
    message: string;
    shape: Rect;
};

export type CreatorState = {
    cursor: number;
    error: SerializedError | null;
    staged: CreatorItem | null;
    status: CreatorStatus;
};
