import { Rect, SerializedError } from '../../@types';

export enum CreatorStatus {
    init = 'init',
    pending = 'pending',
    rejected = 'rejected',
    staged = 'staged',
}

export type CreatorItem = {
    location: number;
    shape: Rect;
};

export type CreatorState = {
    cursor: number;
    error: SerializedError | null;
    message: string;
    staged: CreatorItem | null;
    status: CreatorStatus;
};
