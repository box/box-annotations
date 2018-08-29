/**
 * @flow
 * @file Flow types
 * @author Box
 */
/* eslint-disable no-use-before-define */
type AnnotationPermissions = {
    can_edit: boolean,
    can_delete: boolean
};

type FilePermissions = {
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

// API response
type Location = {
    dimensions: { // original file dimensions
        x: Number,
        y: Number
    },
    page: Number
};

type PointLocation = Coordinates & Location;

type HighlightLocation = {
    quadpoints: QuadPoints
} & Location;

type DrawingLocation = {
    minX: Number,
    minY: Number,
    maxX: Number, 
    maxY: Number,
    paths: DrawingPaths
} & Location;

//--------------------------------------------------------------------------
// API Response
//--------------------------------------------------------------------------
type User = {
    type: 'user',
    id: string,
    name: string,
    login: string,
    profile_image: string
};

type AnnotationDetails = {
    threadID: string,
    type: string,
    location: PointLocation | HighlightLocation | DrawingLocation
};

type BoxFile = {
    id: string,
    type: 'file_version'
};

type Annotation = {
    id: string, 
    item: BoxFile,
    message: string,
    thread: string,
    created_by: User,
    permissions: AnnotationPermissions,
    created_at: string,
    modified_at: string,
    details: AnnotationDetails
};