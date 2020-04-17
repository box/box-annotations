/* eslint-disable flowtype/no-types-missing-file-annotation, no-use-before-define */
import { Permissions } from './api';

// New Data Model Types
export interface Annotation {
    created_at: string;
    created_by: User;
    description?: Reply;
    id: string;
    modified_at: string;
    modified_by: User;
    permissions: Permissions;
    replies?: Array<Reply>;
    target: Target;
    type: 'annotation';
}

export interface Page {
    type: 'page';
    value: number;
}

export interface User {
    id: string;
    login: string;
    name: string;
    type: 'user';
}

export interface Rect {
    fill?: string;
    height: number;
    stroke?: Stroke;
    type: 'rect';
    width: number;
    x: number;
    y: number;
}

export interface Reply {
    created_at: string;
    created_by: User;
    id: string;
    message: string;
    parent: {
        id: string;
        type: string;
    };
    type: 'reply';
}

export interface Stroke {
    color: string;
    size: number;
}

export type Target = TargetDrawing | TargetHighlight | TargetPoint | TargetRegion;

export interface TargetDrawing {
    location: Page;
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
    location: Page;
    shapes: Array<Rect>;
    text: string;
    type: 'highlight';
}

export interface TargetPoint {
    location: Page;
    type: 'point';
    x: number;
    y: number;
}

export interface TargetRegion {
    location: Page;
    shape: Rect;
    type: 'region';
}
