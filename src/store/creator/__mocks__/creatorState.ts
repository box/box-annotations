import { CreatorStatus } from '../types';

export const pageCreatorState = {
    cursor: 0,
    error: null,
    message: 'test',
    referenceId: '100001',
    staged: {
        location: 1,
        shape: {
            height: 100,
            width: 100,
            type: 'rect' as const,
            x: 10,
            y: 10,
        },
        type: 'region' as const,
        targetType: 'page' as const,
    },
    status: CreatorStatus.init,
};


export const videoCreatorState = {
    cursor: 0,
    error: null,
    message: 'test',
    referenceId: '20001',
    staged: {
        location: 120,
        shape: {
            height: 100, 
            width: 100,
            type: 'rect' as const,
            x: 10,
            y: 10,
        },
        type: 'region' as const,
        targetType: 'frame' as const,
    },
    status: CreatorStatus.init,
};