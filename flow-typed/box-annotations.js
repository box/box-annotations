/**
 * @flow
 * @file Flow types
 * @author Box
 */
/* eslint-disable no-use-before-define */
import type { $AxiosError, Axios, CancelTokenSource } from 'axios';
import EventEmitter from 'events';
import AnnotationThread from '../src/AnnotationThread';
import DrawingThread from '../src/draw/DrawingThread';
import DocHighlightThread from '../src/doc/DocHighlightThread';
import DrawingPath from '../src/drawing/DrawingPath';
import CreateHighlightDialog from '../src/doc/CreateHighlightDialog';

type StringMap = { [string]: string };
type AnnotationPermissions = {
    can_edit: boolean,
    can_delete: boolean,
};

type BoxItemPermissions = {
    can_annotate: boolean,
    can_view_annotations_all: boolean,
    can_view_annotations_self: boolean,
};

type AnnotationType = 'point' | 'plain-highlight' | 'highlight-comment' | 'draw';

type Coordinates = {
    x: number,
    y: number,
};

// [x1, x2, x3, x4, y1, y2, y3 ,y4]
type QuadPoint = {
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
};
type QuadPoints = Array<QuadPoint>;

type Path = {
    path: Array<Coordinates>,
};
type DrawingPaths = Array<Path>;

type Dimensions = {
    x: number,
    y: number,
};

type LocationInfo = {
    dimensions: Dimensions,
    page: number,
};

type PointLocationInfo = Coordinates & LocationInfo;

type HighlightLocationInfo = {
    quadpoints: QuadPoints,
} & LocationInfo;

type DrawingLocationInfo = {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    paths: DrawingPaths,
} & LocationInfo;

type Location = PointLocationInfo | HighlightLocationInfo | DrawingLocationInfo;

type User = {
    type: 'user',
    id: string,
    email: string,
    name?: string,
    avatarUrl?: string,
};

type CommentProps = {
    id: string,
    message: string,
    permissions: AnnotationPermissions,
    createdBy?: User,
    createdAt: string,
    modifiedAt?: string,
    isPending: boolean,
};

type Comments = Array<CommentProps>;

type BoxFileVersion = {
    id: string,
    type: 'file_version',
};

type Annotation = {
    id?: string,
    type: AnnotationType,
    location?: Location,
    threadNumber?: string,
    comments: Comments,
    createdBy?: User,
    createdAt?: string,
    canAnnotate: boolean,
    canDelete: boolean,
};

type Options = {
    apiHost: string,
    fileId: string,
    token: string,
    anonymousUserName: string,
    permissions: BoxItemPermissions,
};

type AnnotationDetails = {
    threadID: string,
    type: AnnotationType,
    location: Location,
};

type BoxUser = {
    type: 'user',
    id: string,
    login: string,
    name: string,
    profile_image: string,
};

type AnnotationData = {
    id: string,
    details: AnnotationDetails,
    item: BoxFileVersion,
    message: string,
    permissions: AnnotationPermissions,
    created_by: BoxUser,
    created_at: string,
    modified_at: string,
    thread: string,
};

export type IntlOptions = {
    messages?: Object,
    language?: string,
    locale?: string,
}

type StringAnyMap = { [string]: any };
type AnnotationMap = { [string]: AnnotationData };
