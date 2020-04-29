import { CreatorStatus } from '../types';

export default {
    cursor: 0,
    error: null,
    staged: {
        location: 1,
        message: 'test',
        shape: {
            height: 100,
            width: 100,
            type: 'rect' as const,
            x: 10,
            y: 10,
        },
    },
    status: CreatorStatus.init,
};
