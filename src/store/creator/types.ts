import { PathGroup, Rect, SerializedError } from '../../@types';

export enum CreatorStatus {
    init = 'init',
    pending = 'pending',
    rejected = 'rejected',
    staged = 'staged',
    started = 'started',
}

export type CreatorItemBase = {
    location: number;
};

export type CreatorItemRegion = CreatorItemBase & {
    shape: Rect;
};

export type CreatorItemHighlight = CreatorItemBase & {
    shapes: Rect[];
};

export type CreatorItemDrawing = CreatorItemBase & {
    pathGroups: Array<PathGroup>;
};

export type CreatorItem = CreatorItemRegion | CreatorItemHighlight | CreatorItemDrawing | null;

export type CreatorState = {
    cursor: number;
    error: SerializedError | null;
    message: string;
    referenceId: string | null;
    staged: CreatorItem;
    status: CreatorStatus;
};
