/**
 * @flow
 * @file Flow types
 * @author Box
 */
/* eslint-disable no-use-before-define */
import type { $AxiosError, Axios, CancelTokenSource } from 'axios';

type StringMap = { [string]: string };
type AnnotationPermissions = {
    can_edit: boolean,
    can_delete: boolean
};

type BoxItemPermissions = {
    can_annotate: boolean,
    can_view_annotations_all: boolean,
    can_view_annotations_self: boolean
};

type AnnotationType = 'point' | 'plain-highlight' | 'highlight-comment' | 'draw';

type Coordinates = {
    x: Number,
    y: Number
};

// [x1, x2, x3, x4, y1, y2, y3 ,y4]
type QuadPoint = {
    x1: Number,
    y1: Number,
    x2: Number,
    y2: Number,
    x3: Number,
    y3: Number,
    x4: Number,
    y4: Number
};
type QuadPoints = Array<QuadPoint>;

type Path = {
    path: Array<Coordinates>
};
type DrawingPaths = Array<Path>;

type OriginalDimensions = {
    width: Number,
    height: Number
}

type LocationInfo = {
    dimensions: OriginalDimensions,
    pageNumber: Number
};

type PointLocationInfo = Coordinates & LocationInfo;

type HighlightLocationInfo = {
    quadpoints: QuadPoints
} & LocationInfo;

type DrawingLocationInfo = {
    minX: Number,
    minY: Number,
    maxX: Number, 
    maxY: Number,
    paths: DrawingPaths
} & LocationInfo;

type Location = PointLocationInfo | HighlightLocationInfo | DrawingLocationInfo;

type User = {
    type: 'user',
    id: string,
    email: string,
    name?: string,
    avatarUrl?: string
};

type CommentProps = {
    id: string, 
    message: string,
    permissions: AnnotationPermissions,
    createdBy?: User, 
    createdAt: string,
    modifiedAt?: string,
    isPending: boolean
};

type Comments = Array<CommentProps>;

type BoxFileVersion = {
    id: string,
    type: 'file_version'
};

type Annotation = {
    id: string,
    item: BoxFileVersion,
    type: AnnotationType,
    location: Location,
    threadNumber: string,
    comments?: Comments,
    createdBy: User, 
    createdAt: string,
    canAnnotate: boolean,
    canDelete: boolean,
    threadID: string
}

type Options = {
    apiHost: string,
    fileId: string,
    token: string,
    anonymousUserName: string
};

type AnnotationDetails = {
    threadID: string,
    type: AnnotationType,
    location: Location
};

type BoxUser = {
    id: string,
    name: string,
    profile_image: string
}

type AnnotationData = {
    id: string,
    details: AnnotationDetails,
    item: BoxFileVersion,
    message: string,
    permissions: AnnotationPermissions,
    created_by: BoxUser, 
    created_at: string,
    modified_at: string,
    thread: string
};

type StringAnyMap = { [string]: any };
type AnnotationMap = { [string]: AnnotationData };