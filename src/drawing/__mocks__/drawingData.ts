export const annotations = [
    {
        id: 'anno_1',
        target: {
            location: { type: 'page' as const, value: 1 },
            path_groups: [
                {
                    paths: [
                        {
                            points: [
                                { x: 10, y: 10 },
                                { x: 11, y: 11 },
                                { x: 12, y: 12 },
                            ],
                        },
                    ],
                    stroke: {
                        color: 'red',
                        size: 1,
                    },
                },
                {
                    paths: [
                        {
                            points: [
                                { x: 20, y: 20 },
                                { x: 21, y: 21 },
                                { x: 22, y: 22 },
                            ],
                        },
                    ],
                    stroke: {
                        color: 'black',
                        size: 4,
                    },
                },
            ],
            type: 'drawing' as const,
        },
    },
    {
        id: 'anno_2',
        target: {
            location: { type: 'page' as const, value: 2 },
            path_groups: [
                {
                    paths: [
                        {
                            points: [
                                { x: 20, y: 20 },
                                { x: 21, y: 21 },
                                { x: 22, y: 22 },
                            ],
                        },
                    ],
                    stroke: {
                        color: 'blue',
                        size: 1,
                    },
                },
                {
                    paths: [
                        {
                            points: [
                                { x: 40, y: 40 },
                                { x: 41, y: 41 },
                                { x: 42, y: 42 },
                            ],
                        },
                    ],
                    stroke: {
                        color: 'green',
                        size: 4,
                    },
                },
            ],
            type: 'drawing' as const,
        },
    },
];
