export const annotations = [
    { id: 'anno_1', target: { type: 'region' }, type: 'annotation' },
    { id: 'anno_2', target: { type: 'region' }, type: 'annotation' },
    { id: 'anno_3', target: { type: 'region' }, type: 'annotation' },
];

export default jest.fn(() => ({
    getAnnotationsAPI: jest.fn(() => ({
        createAnnotation: jest.fn((fileId, fileVersionId, payload, permissions, resolve) => resolve(annotations[0])),
        getAnnotations: jest.fn((fileId, fileVersionId, permissions, resolve) =>
            resolve({ entries: annotations, limit: 1000, next_marker: null }),
        ),
        destroy: jest.fn(),
    })),
    getThreadedCommentsAPI: jest.fn(() => ({
        deleteComment: jest.fn(({ successCallback }) => successCallback()),
        updateComment: jest.fn(({ successCallback }) => successCallback({ id: 'reply_1', message: 'updated' })),
        destroy: jest.fn(),
    })),
}));
