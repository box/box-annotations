import { CreatorStatus } from '../types';

export default {
    cursor: 0,
    error: null,
    message: 'test',
    selection: {
        location: 1,
        rect: {
            height: 10,
            width: 10,
            type: 'rect' as const,
            x: 100,
            y: 100,
        },
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
    },
    status: CreatorStatus.init,
};
