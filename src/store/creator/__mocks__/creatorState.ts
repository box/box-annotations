import { CreatorStatus } from '../types';

export default {
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
