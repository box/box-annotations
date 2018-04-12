import EventEmitter from 'events';
import AnnotationService from './AnnotationService';
import * as util from './util';
import './Annotator.scss';
import {
    CLASS_HIDDEN,
    DATA_TYPE_ANNOTATION_DIALOG,
    CLASS_MOBILE_ANNOTATION_DIALOG,
    CLASS_ANNOTATION_DIALOG,
    CLASS_MOBILE_DIALOG_HEADER,
    ID_MOBILE_ANNOTATION_DIALOG,
    TYPES,
    STATES,
    THREAD_EVENT,
    ANNOTATOR_EVENT,
    CONTROLLER_EVENT,
    CLASS_ANNOTATIONS_LOADED
} from './constants';

class Annotator extends EventEmitter {
    //--------------------------------------------------------------------------
    // Typedef
    //--------------------------------------------------------------------------

    /**
     * The data object for constructing an Annotator.
     * @typedef {Object} AnnotatorData
     * @property {HTMLElement} annotatedElement HTML element to annotate on
     * @property {AnnotationService} [annotationService] Annotations CRUD service
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
        this.isMobile = options.isMobile || false;
        this.hasTouch = options.hasTouch || false;
        this.localized = options.localizedStrings;

        const { apiHost, file, token } = this.options;
        this.fileVersionId = file.file_version.id;
        this.fileId = file.id;

        this.permissions = this.getAnnotationPermissions(this.options.file);
        this.annotationService = new AnnotationService({
            apiHost,
            fileId: this.fileId,
            token,
            canAnnotate: this.permissions.canAnnotate,
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
        this.unbindCustomListenersOnService();
        this.removeListener(ANNOTATOR_EVENT.scale, this.scaleAnnotations);
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
            this.container = document.querySelector(this.options.container);
        }

        // Get annotated element from container
        this.annotatedElement = this.getAnnotatedEl(this.container);

        // Set up mobile annotations dialog
        if (this.isMobile) {
            this.setupMobileDialog();
        }

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
                this.generateThreadMap(this.threadMap);
                this.render();
                this.annotatedElement.classList.add(CLASS_ANNOTATIONS_LOADED);
            })
            .catch((error) => {
                this.emit(ANNOTATOR_EVENT.loadError, error);
            });
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
    getLocationFromEvent(event, annotationType) {}
    /* eslint-enable no-unused-vars */

    /**
     * Must be implemented to create the appropriate new thread, add it to the
     * in-memory map, and return the thread.
     *
     * @param {Object} annotations - Annotations in thread
     * @param {Object} location - Location object
     * @param {string} type - Annotation type
     * @return {AnnotationThread} Created annotation thread
     */
    /* eslint-disable no-unused-vars */
    createAnnotationThread(annotations, location, type) {}
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
        this.bindDOMListeners();
        this.bindCustomListenersOnService(this.annotationService);
        this.addListener(ANNOTATOR_EVENT.scale, this.scaleAnnotations);
        this.setupControllers();
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
            isMobile: this.isMobile,
            hasTouch: this.hasTouch
        };
        Object.keys(this.modeControllers).forEach((type) => {
            const controller = this.modeControllers[type];
            controller.init({
                container: this.container,
                annotatedElement: this.annotatedElement,
                mode: type,
                modeButton: this.modeButtons[type],
                permissions: this.permissions,
                annotator: this,
                localized: this.localized,
                options
            });

            controller.addListener('annotationcontrollerevent', this.handleControllerEvents);
        });

        const pointController = this.modeControllers[TYPES.point];
        if (pointController && this.isMobile) {
            pointController.setupSharedDialog(this.container, {
                isMobile: this.isMobile,
                hasTouch: this.hasTouch,
                localized: this.localized
            });
        }
    }

    /**
     * Sets up the shared mobile dialog element.
     *
     * @protected
     * @return {void}
     */
    setupMobileDialog() {
        this.mobileDialogEl = util.generateMobileDialogEl();
        this.mobileDialogEl.setAttribute('data-type', DATA_TYPE_ANNOTATION_DIALOG);
        this.mobileDialogEl.classList.add(CLASS_MOBILE_ANNOTATION_DIALOG);
        this.mobileDialogEl.classList.add(CLASS_ANNOTATION_DIALOG);
        this.mobileDialogEl.classList.add(CLASS_HIDDEN);
        this.mobileDialogEl.id = ID_MOBILE_ANNOTATION_DIALOG;
        this.container.appendChild(this.mobileDialogEl);
    }

    /**
     * Hides and resets the shared mobile dialog.
     *
     * @return {void}
     */
    removeThreadFromSharedDialog() {
        if (!this.mobileDialogEl || this.mobileDialogEl.classList.contains(CLASS_HIDDEN)) {
            return;
        }

        // Resets the mobile dialog
        util.hideElement(this.mobileDialogEl);
        util.showElement(`.${CLASS_MOBILE_DIALOG_HEADER}`);
        this.mobileDialogEl.removeChild(this.mobileDialogEl.lastChild);
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
        if (!this.permissions.canViewAllAnnotations && !this.permissions.canViewOwnAnnotations) {
            return Promise.resolve({});
        }

        return this.annotationService
            .getThreadMap(this.fileVersionId)
            .then((threads) => {
                this.threadMap = threads;
                this.emit(ANNOTATOR_EVENT.fetch);
            })
            .catch((err) => {
                this.emit(ANNOTATOR_EVENT.loadError, err);
            });
    }

    /**
     * Generates a map of thread ID to annotations in thread by page.
     *
     * @private
     * @param {Object} threadMap - Annotations to generate map from
     * @return {void}
     */
    generateThreadMap(threadMap) {
        const { annotator } = this.options;
        if (!annotator) {
            return;
        }

        // Generate map of page to threads
        Object.keys(threadMap).forEach((threadID) => {
            const annotations = threadMap[threadID];

            // NOTE: Using the last annotation to evaluate if the annotation type
            // is enabled because highlight comment annotations may have a plain
            // highlight as the first annotation in the thread.
            const lastAnnotation = util.getLastAnnotation(annotations);
            if (!lastAnnotation || !this.isModeAnnotatable(lastAnnotation.type)) {
                return;
            }

            // Register a valid annotation thread
            // NOTE: The first annotation in the thread is used to determine the
            // annotation (which shouldn't change regardless of what is specified
            // in later annotations in that specific thread) whereas the last
            // annotation is used to determine the type as specified above
            const firstAnnotation = util.getFirstAnnotation(annotations);
            const thread = this.createAnnotationThread(annotations, firstAnnotation.location, lastAnnotation.type);
            const controller = this.modeControllers[lastAnnotation.type];
            if (controller) {
                controller.registerThread(thread);
            }
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
    bindCustomListenersOnService() {
        const service = this.annotationService;
        if (!service || !(service instanceof AnnotationService)) {
            return;
        }

        /* istanbul ignore next */
        service.addListener(ANNOTATOR_EVENT.error, this.handleServicesErrors);
    }

    /**
     * Unbinds custom event listeners for the Annotation Service.
     *
     * @protected
     * @return {void}
     */
    unbindCustomListenersOnService() {
        const service = this.annotationService;
        if (!service || !(service instanceof AnnotationService)) {
            return;
        }
        service.removeListener(ANNOTATOR_EVENT.error, this.handleServicesErrors);
    }

    /**
     * Gets thread params for the new annotation thread
     *
     * @param {Annotation[]} annotations - Annotations in thread
     * @param {Object} location - Location object
     * @param {string} [type] - Optional annotation type
     * @return {AnnotationThread} Created annotation thread
     */
    getThreadParams(annotations, location, type) {
        const params = {
            annotatedElement: this.annotatedElement,
            annotations,
            annotationService: this.annotationService,
            container: this.container,
            fileVersionId: this.fileVersionId,
            isMobile: this.isMobile,
            hasTouch: this.hasTouch,
            locale: this.locale,
            location,
            type,
            permissions: this.permissions,
            localized: this.localized
        };

        // Set existing thread ID if created with annotations
        const firstAnnotation = util.getFirstAnnotation(annotations);
        if (firstAnnotation) {
            params.threadID = firstAnnotation.threadID;
            params.threadNumber = firstAnnotation.threadNumber;
        }

        return params;
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

        thread.dialog.hasComments = true;
        thread.state = STATES.hover;
        thread.showDialog();
        thread.dialog.postAnnotation(commentText);

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
        return {
            canAnnotate: permissions.can_annotate || false,
            canViewAllAnnotations: permissions.can_view_annotations_all || false,
            canViewOwnAnnotations: permissions.can_view_annotations_self || false
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
        this.setScale(data.scale);
        this.render();
    }

    /**
     * Exits all annotation modes except the specified mode
     *
     * @param {string} mode - Current annotation mode
     * @return {void}
     */
    toggleAnnotationMode(mode) {
        const currentMode = this.getCurrentAnnotationMode();
        if (currentMode) {
            this.modeControllers[currentMode].exit();
        }

        if (currentMode !== mode) {
            this.modeControllers[mode].enter();
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
     * Handle events emitted by the annotaiton service
     *
     * @private
     * @param {Object} [data] - Annotation service event data
     * @param {string} [data.event] - Annotation service event
     * @param {string} [data.data] -
     * @return {void}
     */
    handleServicesErrors(data) {
        let errorMessage = '';
        switch (data.reason) {
            case 'read':
                errorMessage = this.localized.loadError;
                break;
            case 'create':
                errorMessage = this.localized.createError;
                this.loadAnnotations();
                break;
            case 'delete':
                errorMessage = this.localized.deleteError;
                this.loadAnnotations();
                break;
            case 'authorization':
                errorMessage = this.localized.authError;
                break;
            default:
        }

        if (data.error) {
            /* eslint-disable no-console */
            console.error(ANNOTATOR_EVENT.error, data.error);
            /* eslint-enable no-console */
        }

        if (errorMessage) {
            this.emit(ANNOTATOR_EVENT.error, errorMessage);
        }
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
            case CONTROLLER_EVENT.resetMobileDialog:
                this.removeThreadFromSharedDialog();
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
