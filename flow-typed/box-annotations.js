/**
 * @flow
 * @file Flow types
 * @author Box
 */
/* eslint-disable no-use-before-define */
import type { MessageDescriptor, InjectIntlProvidedProps } from 'react-intl';

type AnnotationPermissions = {
    can_edit: boolean,
    can_delete: boolean
};

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

type Path = Array<Coordinates>;

type Location = {
    min: Coordinates,
    max: Coordinates,
    dimensions: {
        x: Number,
        y: Number
    },
    page: Number
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