import DocAnnotator from './doc/DocAnnotator';
import ImageAnnotator from './image/ImageAnnotator';
import DrawingModeController from './controllers/DrawingModeController';
import PointModeController from './controllers/PointModeController';
import HighlightModeController from './controllers/HighlightModeController';
import { TYPES } from './constants';
import { canLoadAnnotations } from './util';

/**
 * NAME: The name of the annotator.
 * CONSTRUCTOR: Constructor for the annotator.
 * VIEWER: The kinds of viewers that can be annotated by this.
 * TYPE: The types of annotations that can be used by this annotator.
 * DEFAULT_TYPES: The default annotation types enabled if none provided.
 */
const ANNOTATORS = [
    {
        NAME: 'Document',
        CONSTRUCTOR: DocAnnotator,
        VIEWER: ['Document', 'Presentation'],
        TYPE: [TYPES.point, TYPES.highlight, TYPES.highlight_comment, TYPES.draw],
        DEFAULT_TYPES: [TYPES.point, TYPES.highlight, TYPES.highlight_comment]
    },
    {
        NAME: 'Image',
        CONSTRUCTOR: ImageAnnotator,
        VIEWER: ['Image', 'MultiImage'],
        TYPE: [TYPES.point],
        DEFAULT_TYPES: [TYPES.point]
    }
];

const ANNOTATOR_TYPE_CONTROLLERS = {
    [TYPES.point]: {
        CONSTRUCTOR: PointModeController
    },
    [TYPES.highlight]: {
        CONSTRUCTOR: HighlightModeController
    },
    [TYPES.highlight_comment]: {
        CONSTRUCTOR: HighlightModeController
    },
    [TYPES.draw]: {
        CONSTRUCTOR: DrawingModeController
    }
};

class BoxAnnotations {
    /**
     * [constructor]
     *
     * @param {Object} viewerOptions - Viewer-specific annotator options
     * @return {BoxAnnotations} BoxAnnotations instance
     */
    constructor(viewerOptions = {}) {
        this.annotators = ANNOTATORS;
        this.viewerOptions = viewerOptions;
    }

    /**
     * Returns the available annotators
     *
     * @return {Array} List of supported annotators
     */
    getAnnotators() {
        return Array.isArray(this.annotators) ? this.annotators : [];
    }

    /**
     * Get all annotators for a given viewer.
     *
     * @param {string} viewerName Name of the viewer to get annotators for
     * @param {Array} [disabledAnnotators] List of disabled annotators
     * @return {Object} Annotator for the viewer
     */
    getAnnotatorsForViewer(viewerName, disabledAnnotators = []) {
        const annotators = this.getAnnotators();
        const annotatorConfig = annotators.find(
            (annotator) => !disabledAnnotators.includes(annotator.NAME) && annotator.VIEWER.includes(viewerName)
        );
        this.instantiateControllers(annotatorConfig);

        return annotatorConfig;
    }

    /**
     * Instantiates and attaches controller instances to an annotator configuration. Does nothing if controller
     * has already been instantiated or the config is invalid.
     *
     * @private
     * @param {Object} annotatorConfig The config where annotation type controller instances should be attached
     * @return {void}
     */
    instantiateControllers(annotatorConfig) {
        if (!annotatorConfig || !annotatorConfig.TYPE || annotatorConfig.CONTROLLERS) {
            return;
        }

        /* eslint-disable no-param-reassign */
        annotatorConfig.CONTROLLERS = {};
        const annotatorTypes = this.getAnnotatorTypes(annotatorConfig);
        annotatorTypes.forEach((type) => {
            if (type in ANNOTATOR_TYPE_CONTROLLERS) {
                annotatorConfig.CONTROLLERS[type] = new ANNOTATOR_TYPE_CONTROLLERS[type].CONSTRUCTOR();
            }
        });
        /* eslint-enable no-param-reassign */
    }

    /**
     * Determines the supported annotation types based on the viewer configurations
     * or passed in options if provided, otherwise using the viewer defaults
     *
     * @private
     * @param {Object} annotatorConfig The config where annotation type controller instances should be attached
     * @return {void}
     */
    getAnnotatorTypes(annotatorConfig) {
        if (this.viewerOptions && this.viewerOptions[annotatorConfig.NAME]) {
            // Sets supported annotation types based on passed in options
            const options = this.viewerOptions[annotatorConfig.NAME];
            if (options.enabledTypes) {
                return options.enabledTypes.filter((type) => {
                    return annotatorConfig.TYPE.some((allowed) => allowed === type);
                });
            }
        } else if (!this.viewerConfig) {
            // Sets supported annotation types to viewer-specific defaults
            return [...annotatorConfig.DEFAULT_TYPES];
        }

        const enabledTypes = this.viewerConfig.enabledTypes || [...annotatorConfig.DEFAULT_TYPES];

        // Keeping disabledTypes for backwards compatibility
        const disabledTypes = this.viewerConfig.disabledTypes || [];

        return enabledTypes.filter((type) => {
            return (
                !disabledTypes.some((disabled) => disabled === type) &&
                annotatorConfig.TYPE.some((allowed) => allowed === type)
            );
        });
    }

    /**
     * Chooses an annotator based on viewer.
     *
     * @param {Object} options Viewer options
     * @param {Object} [viewerConfig] Viewer-specific annotations configs
     * @param {Array} [disabledAnnotators] List of disabled annotators
     * @return {Object|null} A copy of the annotator to use, if available
     */
    determineAnnotator(options, viewerConfig = {}, disabledAnnotators = []) {
        let modifiedAnnotator = null;

        this.viewerConfig = viewerConfig;
        const hasAnnotationPermissions = canLoadAnnotations(options.file.permissions);
        const annotator = this.getAnnotatorsForViewer(options.viewer.NAME, disabledAnnotators);
        if (!hasAnnotationPermissions || !annotator || this.viewerConfig.enabled === false) {
            return modifiedAnnotator;
        }

        modifiedAnnotator = Object.assign({}, annotator);
        modifiedAnnotator.TYPE = this.getAnnotatorTypes(modifiedAnnotator);

        return modifiedAnnotator;
    }
}

global.BoxAnnotations = BoxAnnotations;
export default BoxAnnotations;
