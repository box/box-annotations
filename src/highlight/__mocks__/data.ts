import { AnnotationHighlight, Rect, TargetHighlight, User } from '../../@types';

export const rect: Rect = {
    type: 'rect' as const,
    height: 10,
    width: 20,
    x: 5,
    y: 5,
};

export const target: TargetHighlight = {
    location: {
        type: 'page' as const,
        value: 1,
    },
    shapes: [rect],
    type: 'highlight' as const,
};

export const user: User = {
    id: '1',
    login: 'johndoe',
    name: 'John Doe',
    type: 'user' as const,
};

export const annotation: AnnotationHighlight = {
    created_at: '2020-01-01T00:00:00Z',
    created_by: user,
    id: '123',
    modified_at: '2020-01-02T00:00:00Z',
    modified_by: user,
    permissions: {
        can_delete: true,
        can_edit: true,
    },
    target,
    type: 'annotation' as const,
};
