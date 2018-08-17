// @flow
/* eslint-disable no-use-before-define */
type AnnotationPermissions = {
    can_edit: boolean,
    can_delete: boolean
};

type Coordinates = {
    x: string,
    y: string
};

// [x1, x2, x3, x4, y1, y2, y3 ,y4]
type QuadPoint = {
    x1: string,
    y1: string,
    x2: string,
    y2: string,
    x3: string,
    y3: string,
    x4: string,
    y4: string
};
type QuadPoints = Array<QuadPoint>;

type Path = Array<Coordinates>;

type Location = {
    min: Coordinates,
    max: Coordinates,
    dimensions: {
        x: string,
        y: string
    },
    page: string
};

type PointLocation = {
    coordinates: Coordinates
} & Location;

type HighlightLocation = {
    coordinates: QuadPoints
} & Location;

type DrawingLocation = {
    coordinates: Path
} & Location;

type User = {
    type: 'user',
    id: string,
    name: string,
    email?: string,
    avatarUrl?: string
};

type AnnotationType = 'point' | 'plain-highlight' | 'highlight-comment' | 'draw';

type Annotation = {
    annotationId: string,
    text: ?string,
    type: AnnotationType,
    location: Location,
    user: User,
    permissions: AnnotationPermissions,
    created: string,
    modified: string,
    isPending: boolean
};

type FilePermissions = {
    can_annotate: boolean,
    can_view_annotations_all: boolean,
    can_view_annotations_self: boolean
};

type Thread = {
    threadId: string,
    fileVersionId: string,
    threadNumber: string,
    type: AnnotationType,
    annotations: [Annotation],
    permissions: FilePermissions,
    reply: Function,
    delete: Function,
    destroy: Function,
    move: Function
};
