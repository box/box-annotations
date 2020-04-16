import getProp from 'lodash/get';
import DocumentAnnotator from './document/DocumentAnnotator';
import DrawingModeController from './controllers/DrawingModeController';
import PointModeController from './controllers/PointModeController';
import HighlightModeController from './controllers/HighlightModeController';
import { TYPES } from './constants';
import { Permissions, PERMISSIONS } from './@types';

type Annotator = {
    CONSTRUCTOR: typeof DocumentAnnotator;
    CONTROLLERS?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    NAME: string;
    TYPES: string[];
    VIEWERS: string[];
};

type PreviewOptions = {
    file?: {
        permissions?: Permissions;
    };
    viewer?: {
        NAME: string;
    };
};

type ViewerConfig = {
    enabled?: boolean;
    enabledTypes?: string[];
};

type ViewerOption = {
    enabledTypes?: string[];
};

type ViewerOptions = Record<string, ViewerOption>;

/**
 * NAME: The name of the annotator.
 * CONSTRUCTOR: Constructor for the annotator.
 * VIEWERS: The kinds of viewers that can be annotated by this.
 * TYPES: The types of annotations that can be used by this annotator.
 */
const ANNOTATORS: Annotator[] = [
    {
        NAME: 'Document',
        CONSTRUCTOR: DocumentAnnotator,
        VIEWERS: ['Document', 'Presentation'],
        TYPES: [TYPES.draw, TYPES.highlight, TYPES.highlight_comment, TYPES.point],
    },
];

const ANNOTATOR_TYPE_CONTROLLERS = {
    [TYPES.point]: {
        CONSTRUCTOR: PointModeController,
    },
    [TYPES.highlight]: {
        CONSTRUCTOR: HighlightModeController,
    },
    [TYPES.highlight_comment]: {
        CONSTRUCTOR: HighlightModeController,
    },
    [TYPES.draw]: {
        CONSTRUCTOR: DrawingModeController,
    },
};

class BoxAnnotations {
    annotators: Annotator[];

    viewerOptions?: ViewerOptions | null;

    /**
     * [constructor]
     *
     * @param {Object} viewerOptions - Viewer-specific annotator options
     * @return {BoxAnnotations} BoxAnnotations instance
     */
    constructor(viewerOptions?: ViewerOptions) {
        this.annotators = ANNOTATORS;
        this.viewerOptions = viewerOptions;
    }

    canLoad(permissions?: Permissions): boolean {
        if (!permissions) {
            return false;
        }

        return (
            !!permissions[PERMISSIONS.CAN_ANNOTATE] ||
            !!permissions[PERMISSIONS.CAN_VIEW_ANNOTATIONS_ALL] ||
            !!permissions[PERMISSIONS.CAN_VIEW_ANNOTATIONS_SELF]
        );
    }

    instantiateControllers(annotator: Annotator): Annotator | null {
        if (!annotator || !annotator.TYPES || annotator.CONTROLLERS) {
            return annotator;
        }

        annotator.TYPES.forEach(type => {
            if (type in ANNOTATOR_TYPE_CONTROLLERS) {
                annotator.CONTROLLERS = annotator.CONTROLLERS || {};
                annotator.CONTROLLERS[type] = new ANNOTATOR_TYPE_CONTROLLERS[type].CONSTRUCTOR(annotator.NAME);
            }
        });

        return annotator;
    }

    /**
     * Returns the available annotators
     *
     * @return {Array} List of supported annotators
     */
    getAnnotators(): Annotator[] {
        return Array.isArray(this.annotators) ? this.annotators : [];
    }

    /**
     * Get all annotators for a given viewer.
     *
     * @param {string} viewerName Name of the viewer to get annotators for
     * @return {Object} Annotator for the viewer
     */
    getAnnotatorsForViewer(viewerName = ''): Annotator | undefined {
        return this.getAnnotators().find(annotator => annotator.VIEWERS.includes(viewerName));
    }

    /**
     * Chooses an annotator based on viewer.
     *
     * @param {Object} previewOptions Preview-specific options
     * @param {Object} [viewerConfig] Viewer-specific annotations config
     * @return {Object|null} A copy of the annotator to use, if available
     */
    determineAnnotator(previewOptions: PreviewOptions, viewerConfig: ViewerConfig = {}): Annotator | null {
        const annotator = this.getAnnotatorsForViewer(getProp(previewOptions, 'viewer.NAME'));
        const canLoad = this.canLoad(getProp(previewOptions, 'file.permissions'));

        if (!annotator || !canLoad || viewerConfig.enabled === false) {
            return null;
        }

        const enabledTypesOption = getProp(this.viewerOptions, [annotator.NAME, 'enabledTypes']);
        const enabledTypesViewer = getProp(viewerConfig, 'enabledTypes');
        const enabledTypesBase = enabledTypesOption || enabledTypesViewer || annotator.TYPES || [];
        const enabledTypes = enabledTypesBase.filter((type: string) => annotator.TYPES.some(t => t === type));

        return this.instantiateControllers({ ...annotator, TYPES: enabledTypes });
    }
}

global.BoxAnnotations = BoxAnnotations;
export default BoxAnnotations;
