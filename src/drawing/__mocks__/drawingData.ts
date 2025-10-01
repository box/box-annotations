export const pathGroups = [
    {
        clientId: '1_1',
        paths: [
            {
                clientId: '1_1_1',
                points: [
                    { x: 10, y: 10 },
                    { x: 11, y: 11 },
                    { x: 12, y: 12 },
                ],
            },
        ],
        stroke: {
            color: '#f00',
            size: 1,
        },
    },
    {
        clientId: '1_2',
        paths: [
            {
                clientId: '1_2_1',
                points: [
                    { x: 20, y: 20 },
                    { x: 21, y: 21 },
                    { x: 22, y: 22 },
                ],
            },
        ],
        stroke: {
            color: '#000',
            size: 4,
        },
    },
];

export const annotations = [
    {
        id: 'drawing_anno_1',
        created_at: '2023-01-01T00:00:00Z',
        created_by: { id: 'user1', login: 'user1@example.com', name: 'User 1', type: 'user' },
        modified_at: '2023-01-01T00:00:00Z',
        modified_by: { id: 'user1', login: 'user1@example.com', name: 'User 1', type: 'user' },
        permissions: { can_edit: true, can_delete: true },
        type: 'annotation',
        target: {
            location: { type: 'page' as const, value: 1 },
            path_groups: pathGroups,
            type: 'drawing' as const,
        },
    },
    {
        id: 'drawing_anno_2',
        created_at: '2023-01-01T00:00:00Z',
        created_by: { id: 'user1', login: 'user1@example.com', name: 'User 1', type: 'user' },
        modified_at: '2023-01-01T00:00:00Z',
        modified_by: { id: 'user1', login: 'user1@example.com', name: 'User 1', type: 'user' },
        permissions: { can_edit: true, can_delete: true },
        type: 'annotation',
        target: {
            location: { type: 'page' as const, value: 2 },
            path_groups: [
                {
                    clientId: '2_1',
                    paths: [
                        {
                            clientId: '2_1_1',
                            points: [
                                { x: 20, y: 20 },
                                { x: 21, y: 21 },
                                { x: 22, y: 22 },
                            ],
                        },
                    ],
                    stroke: {
                        color: '#00f',
                        size: 1,
                    },
                },
                {
                    clientId: '2_2',
                    paths: [
                        {
                            clientId: '2_2_1',
                            points: [
                                { x: 40, y: 40 },
                                { x: 41, y: 41 },
                                { x: 42, y: 42 },
                            ],
                        },
                    ],
                    stroke: {
                        color: '#0f0',
                        size: 4,
                    },
                },
            ],
            type: 'drawing' as const,
        },
    },
];

export const videoAnnotations = [
    {
        id: 'video_drawing_anno_1',
        created_at: '2023-01-01T00:00:00Z',
        created_by: { id: 'user1', login: 'user1@example.com', name: 'User 1', type: 'user' },
        modified_at: '2023-01-01T00:00:00Z',
        modified_by: { id: 'user1', login: 'user1@example.com', name: 'User 1', type: 'user'},
        permissions: { can_edit: true, can_delete: true },
        type: 'annotation',
        target: {
            location: { type: 'frame', value: 10000 },
            path_groups: pathGroups,
            type: 'drawing' as const,
        },     
        pathGroups: {
            clientId: '1_1',
            paths: [
                {
                    clientId: '1_1_1',
                    points: [
                        { x: 10, y: 10 },
                        { x: 11, y: 11 },
                        { x: 12, y: 12 },
                    ],
                },
            ],
        },
        stroke: {
            color: '#f00',
            size: 1,
        },
    },
    {
        id: 'video_drawing_anno_2',
        created_at: '2023-01-01T00:00:00Z',
        created_by: { id: 'user1', login: 'user1@example.com', name: 'User 1', type: 'user' },
        modified_at: '2023-01-01T00:00:00Z',
        modified_by: { id: 'user1', login: 'user1@example.com', name: 'User 1', type: 'user' },
        permissions: { can_edit: true, can_delete: true },
        type: 'annotation',
        target: {
            location: { type: 'frame', value: 20000 },
            path_groups: pathGroups,
            type: 'drawing' as const,
        },
        pathGroups: {
            clientId: '2_1',
            paths: [
                {
                    clientId: '2_1_1',
                    points: [
                        { x: 20, y: 20 },
                        { x: 21, y: 21 },
                        { x: 22, y: 22 },
                    ],
                },
            ],
        },
        stroke: {
            color: '#000',
            size: 4,
        },
    },

    {
        id: 'video_drawing_anno_3',
        created_at: '2023-01-01T00:00:00Z',
        created_by: { id: 'user1', login: 'user1@example.com', name: 'User 1', type: 'user' },
        modified_at: '2023-01-01T00:00:00Z',
        modified_by: { id: 'user1', login: 'user1@example.com', name: 'User 1', type: 'user' },
        permissions: { can_edit: true, can_delete: true },
        type: 'annotation',
        target: {
            location: { type: 'frame', value: 30000 },
            path_groups: pathGroups,
            type: 'drawing' as const,
        },
        pathGroups: {
            clientId: '2_2',
            paths: [
                {
                    clientId: '2_2_1',
                    points: [
                        { x: 40, y: 40 },
                        { x: 41, y: 41 },
                        { x: 42, y: 42 },
                    ],
                },
            ],
        },
        stroke: {
            color: '#0f0',
            size: 4,
        },
    },
];
