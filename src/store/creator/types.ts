import { Rect, SerializedError } from '../../@types';

export enum CreatorStatus {
    init = 'init',
    pending = 'pending',
    rejected = 'rejected',
    staged = 'staged',
    started = 'started',
}

export type CreatorItem = {
    location: number;
    shape: Rect;
};

export type CreatorState = {
    cursor: number;
    error: SerializedError | null;
    selection: SelectionItem | null;
    message: string;
    staged: CreatorItem | null;
    status: CreatorStatus;
};

export type SelectionItem = {
    location: number;
    rect: Rect;
};
