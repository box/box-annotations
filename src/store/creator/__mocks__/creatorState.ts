import { CreatorStatus } from '../types';

export default {
    cursor: 0,
    error: null,
    message: 'test',
    referenceShape: {
        height: 10,
        width: 10,
        x: 10,
        y: 10,
    },
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
    },
    status: CreatorStatus.init,
};
