export const annotations = [
    { id: 'anno_1', target: { shape: { height: 10, width: 10, x: 10, y: 10, type: 'rect' }, type: 'region' } },
    { id: 'anno_2', target: { shape: { height: 20, width: 20, x: 20, y: 20, type: 'rect' }, type: 'region' } },
    { id: 'anno_3', target: { shape: { height: 30, width: 30, x: 30, y: 30, type: 'rect' }, type: 'region' } },
];

export const scale = 1;

export const rect = {
    type: 'rect' as const,
    height: 10,
    width: 10,
    x: 10,
    y: 10,
};

export const target = {
    id: 'target_1',
    shape: rect,
    type: 'region' as const,
};
