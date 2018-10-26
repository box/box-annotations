import EventEmitter from 'events';
import * as util from './util';
import './Annotator.scss';
import {
    TYPES,
    STATES,
    THREAD_EVENT,
    ANNOTATOR_EVENT,
    CONTROLLER_EVENT,
    CLASS_ANNOTATIONS_LOADED,
    SELECTOR_BOX_PREVIEW_HEADER_CONTAINER
} from './constants';
import FileVersionAPI from './api/FileVersionAPI';

class Annotator extends EventEmitter {
    //--------------------------------------------------------------------------
    // Typedef
    //--------------------------------------------------------------------------

    /**
     * The data object for constructing an Annotator.
     * @typedef {Object} AnnotatorData
     * @property {HTMLElement} annotatedElement HTML element to annotate on
     * @property {string} fileVersionId File version ID
     */

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * [constructor]
     *
     * @param {Object} options - Options for constructing an Annotator
     * @return {Annotator} Annotator instance
     */
    constructor(options) {
        super();

        this.options = options;
        this.locale = options.location.locale || 'en-US';
        this.validationErrorEmitted = false;
        this.hasTouch = options.hasTouch || false;
        this.localized = options.localizedStrings;

        const { apiHost, file, token } = this.options;
        this.fileVersionId = file.file_version.id;
        this.fileId = file.id;

        this.permissions = this.getAnnotationPermissions(this.options.file);

        this.api = new FileVersionAPI({
            apiHost,
            fileId: this.fileId,
            token,
            permissions: this.permissions,
            anonymousUserName: this.localized.anonymousUserName
        });

        // Get applicable annotation mode controllers
        const { CONTROLLERS } = this.options.annotator || {};
        this.modeControllers = CONTROLLERS || {};

        this.fetchPromise = this.fetchAnnotations();

        // Explicitly binding listeners
        this.createPointThread = this.createPointThread.bind(this);
        this.scaleAnnotations = this.scaleAnnotations.bind(this);
        this.handleControllerEvents = this.handleControllerEvents.bind(this);
        this.handleServicesErrors = this.handleServicesErrors.bind(this);
        this.hideAnnotations = this.hideAnnotations.bind(this);
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        // Destroy all annotate buttons
        Object.keys(this.modeControllers).forEach((mode) => {
            this.modeControllers[mode].destroy();
        });

        this.unbindDOMListeners();
        this.unbindCustomListeners();
    }

    /**
     * Initializes annotator.
     *
     * @param {number} [initialScale] - The initial scale factor to render the annotations
     * @return {void}
     */
    init(initialScale = 1) {
        // Get the container dom element if selector was passed, in tests
        this.container = this.options.container;
        if (typeof this.options.container === 'string') {
            this.container = document.querySelector(this.container);
        }

        // Get the header dom element if selector was passed, in tests
        this.headerElement = this.options.headerElement;
        if (typeof this.headerElement === 'string') {
            this.headerElement = document.querySelector(this.headerElement);
        }

        // If using box content preview header and no external header element was specified,
        // fallback to the container element
        if (this.options.header !== 'none' && !this.headerElement) {
            this.headerElement = this.container.querySelector(SELECTOR_BOX_PREVIEW_HEADER_CONTAINER);
        }

        if (!this.container) {
            this.emit(ANNOTATOR_EVENT.loadError, this.localized.loadError);
            return;
        }

        this.container.classList.add('ba');

        // Get annotated element from container
        this.annotatedElement = this.getAnnotatedEl(this.container);

        this.setScale(initialScale);
        this.setupAnnotations();
        this.loadAnnotations();
    }

    /**
     * Returns whether or not the current annotation mode is enabled for
     * the current viewer/annotator.
     *
     * @param {string} type - Type of annotation
     * @return {boolean} Whether or not the annotation mode is enabled
     */
    isModeAnnotatable(type) {
        if (!this.options.annotator) {
            return false;
        }

        const { TYPE: annotationTypes } = this.options.annotator;
        if (type && annotationTypes) {
            if (!annotationTypes.some((annotationType) => type === annotationType)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Shows saved annotations.
     *
     * @return {void}
     */
    loadAnnotations() {
        this.fetchPromise
            .then(() => {
                this.generateAnnotationMap(this.annotationMap);
                this.render();
                this.annotatedElement.classList.add(CLASS_ANNOTATIONS_LOADED);
            })
            .catch((error) => this.emit(ANNOTATOR_EVENT.loadError, error));
    }

    /**
     * Sets the zoom scale.
     *
     * @param {number} scale - current zoom scale
     * @return {void}
     */
    setScale(scale) {
        this.annotatedElement.setAttribute('data-scale', scale);
    }

    //--------------------------------------------------------------------------
    // Abstract
    //--------------------------------------------------------------------------

    /**
     * Must be implemented to return an annotation location object from the DOM
     * event.
     *
     * @param {Event} event - DOM event
     * @param {string} annotationType - Type of annotation
     * @return {Object} Location object
     */
    /* eslint-disable no-unused-vars */
    getLocationFromEvent = (event, annotationType) => {};
    /* eslint-enable no-unused-vars */

    /**
     * Must be implemented to determine the annotated element in the viewer.
     *
     * @param {HTMLElement} containerEl - Container element for the viewer
     * @return {HTMLElement} Annotated element in the viewer
     */
    /* eslint-disable no-unused-vars */
    getAnnotatedEl(containerEl) {}
    /* eslint-enable no-unused-vars */

    //--------------------------------------------------------------------------
    // Protected
    //--------------------------------------------------------------------------

    /**
     * Annotations setup.
     *
     * @protected
     * @return {void}
     */
    setupAnnotations() {
        // Map of page => {threads on page}
        this.setupControllers();
        this.bindDOMListeners();
        this.bindCustomListeners();
    }

    /**
     * Mode controllers setup.
     *
     * @protected
     * @return {void}
     */
    setupControllers() {
        this.modeButtons = this.options.modeButtons || {};

        const options = {
            header: this.options.header,
            hasTouch: this.hasTouch,
            locale: this.locale
        };
        Object.keys(this.modeControllers).forEach((type) => {
            const controller = this.modeControllers[type];
            controller.init({
                container: this.container,
                headerElement: this.headerElement,
                annotatedElement: this.annotatedElement,
                mode: type,
                modeButton: this.modeButtons[type],
                permissions: this.permissions,
                localized: this.localized,
                fileId: this.fileId,
                fileVersionId: this.fileVersionId,
                apiHost: this.options.apiHost,
                token: this.options.token,
                getLocation: this.getLocationFromEvent,
                options
            });

            controller.addListener('annotationcontrollerevent', this.handleControllerEvents);
        });
    }

    /**
     * Hides all non-pending annotations if mouse event occurs outside an
     * annotation dialog and click did not occur inside an annotation dialog
     *
     * @param {Event} [event] - Mouse event
     * @return {void}
     */
    hideAnnotations(event) {
        if (event && util.isInDialog(event, this.container)) {
            return;
        }

        Object.keys(this.modeControllers).forEach((mode) => {
            this.modeControllers[mode].destroyPendingThreads();
            this.modeControllers[mode].applyActionToThreads((thread) => {
                thread.unmountPopover();
            });
        });
    }

    /**
     * Fetches persisted annotations, creates threads as needed, and generates
     * an in-memory map of page to threads.
     *
     * @protected
     * @return {Promise} Promise for fetching saved annotations
     */
    fetchAnnotations() {
        // Do not load any pre-existing annotations if the user does not have
        // the correct permissions
        if (!this.permissions.can_view_annotations_all && !this.permissions.can_view_annotations_self) {
            return Promise.resolve({});
        }

        return this.api
            .fetchVersionAnnotations(this.fileVersionId)
            .then((threads) => {
                this.annotationMap = threads;
                this.emit(ANNOTATOR_EVENT.fetch);
            })
            .catch((err) => {
                this.emit(ANNOTATOR_EVENT.loadError, err);
            });
    }

    /**
     * Generates a map of annotations by page.
     *
     * @private
     * @param {Object} annotationMap - Annotations to generate map from
     * @return {void}
     */
    generateAnnotationMap(annotationMap) {
        const { annotator } = this.options;
        if (!annotator) {
            return;
        }

        // Generate map of page to annotations
        Object.keys(annotationMap).forEach((id) => {
            const annotation = annotationMap[id];

            const controller = this.modeControllers[annotation.type];
            if (!controller) {
                return;
            }

            controller.registerThread(annotation);
        });
    }

    /**
     * Binds DOM event listeners. Can be overridden by any annotator that
     * needs to bind event listeners to the DOM in the normal state (ie not
     * in any annotation mode).
     *
     * @protected
     * @return {void}
     */
    bindDOMListeners() {}

    /**
     * Unbinds DOM event listeners. Can be overridden by any annotator that
     * needs to bind event listeners to the DOM in the normal state (ie not
     * in any annotation mode).
     *
     * @protected
     * @return {void}
     */
    unbindDOMListeners() {}

    /**
     * Binds custom event listeners for the Annotation Service.
     *
     * @protected
     * @return {void}
     */
    bindCustomListeners() {
        this.addListener(ANNOTATOR_EVENT.scale, this.scaleAnnotations);
        this.api.addListener(ANNOTATOR_EVENT.error, this.handleServicesErrors);
    }

    /**
     * Unbinds custom event listeners for the Annotation Service.
     *
     * @protected
     * @return {void}
     */
    unbindCustomListeners() {
        this.removeListener(ANNOTATOR_EVENT.scale, this.scaleAnnotations);
        this.api.removeListener(ANNOTATOR_EVENT.error, this.handleServicesErrors);
    }

    /**
     * Returns the current annotation mode
     *
     * @protected
     * @return {string|null} Current annotation mode
     */
    getCurrentAnnotationMode() {
        const modes = Object.keys(this.modeControllers).filter((mode) => {
            const controller = this.modeControllers[mode];
            return controller.isEnabled();
        });
        return modes[0] || null;
    }

    /**
     * Creates a point annotation thread, adds it to in-memory map, and returns it.
     *
     * @private
     * @param {Object} data - Thread data
     * @param {string} data.commentText - The text for the first comment in
     * the thread.
     * @param {string} data.lastPointEvent - Point event for the annotation location
     * @param {string} data.pendingThreadID - Thread ID for the current pending point thread
     * @return {AnnotationThread} Created point annotation thread
     */
    createPointThread(data) {
        // Empty string will be passed in if no text submitted in comment
        const { commentText, lastPointEvent, pendingThreadID } = data;
        if (!lastPointEvent || !pendingThreadID || !commentText || commentText.trim() === '') {
            return null;
        }

        const location = this.getLocationFromEvent(lastPointEvent, TYPES.point);
        if (!location) {
            return null;
        }

        const controller = this.modeControllers[TYPES.point];
        const thread = controller.getThreadByID(pendingThreadID);
        if (!controller || !thread) {
            return null;
        }

        thread.state = STATES.active;
        thread.renderAnnotationPopover();
        thread.save(TYPES.point, commentText);

        this.emit(THREAD_EVENT.threadSave, thread.getThreadEventData());
        return thread;
    }

    //--------------------------------------------------------------------------
    // Private
    //--------------------------------------------------------------------------

    /**
     * Renders annotations from memory.
     *
     * @private
     * @return {void}
     */
    render() {
        Object.keys(this.modeControllers).forEach((mode) => {
            const controller = this.modeControllers[mode];
            controller.render();
        });
    }

    /**
     * Renders annotations from memory for a specified page.
     *
     * @private
     * @param {number} pageNum - Page number
     * @return {void}
     */
    renderPage(pageNum) {
        Object.keys(this.modeControllers).forEach((mode) => this.modeControllers[mode].renderPage(pageNum));
    }

    /**
     * Returns annotation permissions
     *
     * @private
     * @param {Object} file - File
     * @return {boolean} Whether or not the annotation mode is enabled
     */
    getAnnotationPermissions(file) {
        const permissions = file.permissions || {};
        const {
            can_annotate = false,
            can_view_annotations_all = false,
            can_view_annotations_self = false
        } = permissions;
        return {
            can_annotate,
            can_view_annotations_all,
            can_view_annotations_self
        };
    }

    /**
     * Orient annotations to the correct scale and orientation of the annotated document.
     *
     * @private
     * @param {Object} data - Scale and orientation values needed to orient annotations.
     * @return {void}
     */
    scaleAnnotations(data) {
        this.unbindDOMListeners();
        this.setScale(data.scale);
        this.render();
        this.bindDOMListeners();
    }

    /**
     * Exits all annotation modes except the specified mode
     *
     * @param {string} mode - Current annotation mode
     * @return {void}
     */
    toggleAnnotationMode(mode) {
        this.hideAnnotations();
        this.unbindDOMListeners();

        const currentMode = this.getCurrentAnnotationMode();
        if (currentMode) {
            this.modeControllers[currentMode].exit();
        }

        if (currentMode !== mode) {
            this.modeControllers[mode].enter();
        } else {
            this.bindDOMListeners();
        }
    }

    /**
     * Scrolls specified annotation into view
     *
     * @private
     * @param {Object} threadID - annotation threadID for thread that should scroll into view
     * @return {void}
     */
    scrollToAnnotation(threadID) {
        if (!threadID) {
            return;
        }

        Object.keys(this.modeControllers).forEach((mode) => {
            const thread = this.modeControllers[mode].getThreadByID(threadID);
            if (thread) {
                thread.scrollIntoView();
            }
        });
    }

    /**
     * Displays annotation validation error notification once on load. Does
     * nothing if notification was already displayed once.
     *
     * @private
     * @return {void}
     */
    handleValidationError() {
        if (this.validationErrorEmitted) {
            return;
        }

        this.emit(ANNOTATOR_EVENT.error, this.localized.loadError);
        /* eslint-disable no-console */
        console.error('Annotation could not be created due to invalid params');
        /* eslint-enable no-console */
        this.validationErrorEmitted = true;
    }

    /**
     * Handle events emitted by the annotation service
     *
     * @private
     * @param {Object} [data] - Annotation service event data
     * @param {string} [data.event] - Annotation service event
     * @param {string} [data.data] -
     * @return {void}
     */
    handleServicesErrors(data) {
        if (data.error) {
            /* eslint-disable no-console */
            console.error(ANNOTATOR_EVENT.error, data.error);
            /* eslint-enable no-console */
        }

        this.emit(ANNOTATOR_EVENT.error, this.localized.loadError);
    }

    /**
     * Handle events emitted by the annotation service
     *
     * @private
     * @param {Object} [data] - Annotation service event data
     * @param {string} [data.event] - Annotation service event
     * @param {string} [data.data] -
     * @return {void}
     */
    handleControllerEvents(data) {
        switch (data.event) {
            case CONTROLLER_EVENT.load:
                this.loadAnnotations();
                break;
            case CONTROLLER_EVENT.toggleMode:
                this.toggleAnnotationMode(data.mode);
                break;
            case CONTROLLER_EVENT.enter:
                this.emit(data.event, { mode: data.mode });
                this.unbindDOMListeners();
                break;
            case CONTROLLER_EVENT.exit:
                this.emit(data.event, { mode: data.mode });
                this.bindDOMListeners();
                break;
            case CONTROLLER_EVENT.createThread:
                this.createPointThread(data.data);
                break;
            case CONTROLLER_EVENT.error:
                this.emit(ANNOTATOR_EVENT.error, data.data);
                break;
            default:
                this.emit(data.event, data.data);
        }
    }

    /**
     * Emits a generic annotator event
     *
     * @private
     * @emits annotatorevent
     * @param {string} event - Event name
     * @param {Object} data - Event data
     * @return {void}
     */
    emit(event, data) {
        const { annotator } = this.options;
        super.emit(event, data);
        super.emit('annotatorevent', {
            event,
            data,
            annotatorName: annotator ? annotator.NAME : '',
            fileVersionId: this.fileVersionId,
            fileId: this.fileId
        });
    }
}

export default Annotator;
