/**
 * @flow
 * @file Flow types
 * @author Box
 */
/* eslint-disable no-use-before-define */
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

type User = {
    type: 'user',
    id: string,
    email: string,
    name?: string,
    avatarUrl?: string
};

type Comment = {
    id: string, 
    message: string,
    permissions: AnnotationPermissions,
    createdBy: User, 
    createdAt: string,
    modifiedAt: string,
    isPending?: boolean
};

type Comments = Array<Comment>;

type BoxFileVersion = {
    id: string,
    type: 'file_version'
};

type Annotation = {
    id: string,
    item: BoxFileVersion,
    type: string,
    location: PointLocationInfo | HighlightLocationInfo | DrawingLocationInfo,
    threadNumber: string,
    comments?: Comments,
    createdBy: User, 
    createdAt: string,
}
