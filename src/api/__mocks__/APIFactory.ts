export const annotations = [
    { id: 'anno_1', target: { type: 'region' }, type: 'annotation' },
    { id: 'anno_2', target: { type: 'region' }, type: 'annotation' },
    { id: 'anno_3', target: { type: 'region' }, type: 'annotation' },
];

export default jest.fn(() => ({
    getAnnotationsAPI: jest.fn(() => ({
        createAnnotation: jest.fn((fileId, fileVersionId, payload, resolve) => resolve(annotations[0])),
        getAnnotations: jest.fn((fileId, fileVersionId, resolve) =>
            resolve({ entries: annotations, limit: 1000, next_marker: null }),
        ),
        destroy: jest.fn(),
    })),
}));
