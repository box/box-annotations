import { PathGroup } from '../../@types';

export type DrawingState = {
    drawnPathGroups: Array<PathGroup>;
    location: number;
};

export type PathGroupItem = {
    location: number;
    pathGroup: PathGroup;
};
