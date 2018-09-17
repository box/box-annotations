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
    name: string,
    email: string,
    avatarUrl: string
};

type AnnotationDetails = {
    threadID: string,
    type: string,
    location: PointLocationInfo | HighlightLocationInfo | DrawingLocationInfo
};

type Annotation = {
    id: string, 
    message: string,
    permissions: AnnotationPermissions,
    details: AnnotationDetails,
    createdBy: User, 
    createdAt: string,
    modifiedBy?: string,
    isPending?: boolean
};

type Annotations = Array<Annotation>;

type BoxFileVersion = {
    id: string,
    type: 'file_version'
};

type AnnotationThread = {
    item: BoxFileVersion,
    threadNumber: string,
    annotations: Annotations
}

type PointAnnotation = PointLocationInfo & Annotation;
type HighlightAnnotation = HighlightLocationInfo & Annotation;
type DrawAnnotation = DrawingLocationInfo & Annotation;