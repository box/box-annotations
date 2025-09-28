/* eslint-disable no-use-before-define */
import { Permissions } from './api';
import { FRAME, PAGE } from '../constants';

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

export interface AnnotationDrawing extends Annotation {
    target: TargetDrawing;
}

export interface AnnotationHighlight extends Annotation {
    target: TargetHighlight;
}

export interface AnnotationPoint extends Annotation {
    target: TargetPoint;
}

export interface AnnotationRegion extends Annotation {
    target: TargetRegion;
}

export type Dimensions = {
    height: number;
    width: number;
};

export interface Page {
    type: typeof PAGE;
    value: number;
}

export interface Frame {
    type: typeof FRAME;
    value: number;
}

export type Location = Page | Frame;

export interface Path {
    clientId?: string;
    points: Array<Position>;
}
export interface PathGroup {
    clientId?: string;
    paths: Array<Path>;
    stroke: Stroke;
}

export interface Position {
    x: number;
    y: number;
}

export type Shape = Required<DOMRectInit>;

export interface User {
    id: string;
    login: string;
    name: string;
    type: 'user';
}

export interface Rect extends Position {
    fill?: string;
    height: number;
    stroke?: Stroke;
    type: 'rect';
    width: number;
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
    location: Location;
    path_groups: Array<PathGroup>;
    type: 'drawing';
}

export interface TargetHighlight {
    location: Page;
    shapes: Array<Rect>;
    text?: string;
    type: 'highlight';
}

export interface TargetPoint extends Position {
    location: Location;
    type: 'point';
}

export interface TargetRegion {
    location: Location;
    shape: Rect;
    type: 'region';
}

export enum Type {
    highlight = 'highlight',
    region = 'region',
}
