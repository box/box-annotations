/* eslint-disable flowtype/no-types-missing-file-annotation, no-use-before-define */

// New Data Model Types
export interface Annotation {
    createdAt: Date;
    createdBy: User;
    description?: Reply;
    id: string;
    modifiedAt: Date;
    modifiedBy: User;
    permissions: Permissions;
    replies?: Array<Reply>;
    target: Target;
    type: 'annotation';
}

export interface User {
    id: string;
    login: string;
    name: string;
    profileImage: string;
    type: 'user';
}

export interface Rect {
    fill?: string;
    height: number;
    stroke?: Stroke;
    width: number;
    x: number;
    y: number;
}

export interface Reply {
    createdAt: Date;
    createdBy: User;
    id: string;
    message: string;
    parentId: string;
    type: 'reply';
}

export interface Stroke {
    color: string;
    size: number;
}

export type Target = TargetDrawing | TargetHighlight | TargetPoint | TargetRegion;

export interface TargetDrawing {
    location: number;
    paths: [
        {
            points: [
                {
                    x: number;
                    y: number;
                },
            ];
        },
    ];
    stroke: Stroke;
    type: 'drawing';
}

export interface TargetHighlight {
    location: number;
    rects: Array<Rect>;
    text: string;
    type: 'highlight';
}

export interface TargetPoint {
    location: number;
    type: 'point';
    x: number;
    y: number;
}

export interface TargetRegion {
    location: number;
    shape: Rect;
    type: 'region';
}
