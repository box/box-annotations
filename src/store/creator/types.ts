import { Rect } from '../../@types';

export enum CreatorStatus {
    init = 'init',
    ready = 'ready',
}

export type CreatorItem = {
    location: number;
    message: string;
    shape: Rect;
};

export type CreatorState = {
    staged: CreatorItem | null;
    status: CreatorStatus;
};
