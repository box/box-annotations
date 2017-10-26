import EventEmitter from 'events';
import autobind from 'autobind-decorator';
import AnnotationService from './AnnotationService';
import * as annotatorUtil from './annotatorUtil';
import { ICON_CLOSE } from './icons/icons';
import './Annotator.scss';
import {
    CLASS_HIDDEN,
    DATA_TYPE_ANNOTATION_DIALOG,
    CLASS_MOBILE_ANNOTATION_DIALOG,
    CLASS_ANNOTATION_DIALOG,
    CLASS_MOBILE_DIALOG_HEADER,
    CLASS_DIALOG_CLOSE,
    ID_MOBILE_ANNOTATION_DIALOG,
    TYPES,
    ANNOTATOR_EVENT
} from './annotationConstants';

@autobind
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

        const { file } = this.options;
        this.fileVersionId = file.file_version.id;
        this.fileId = file.id;
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

        this.getAnnotationPermissions(this.options.file);
        const { apiHost, file, token } = this.options;
        this.annotationService = new AnnotationService({
            apiHost,
            fileId: file.id,
            token,
            canAnnotate: this.permissions.canAnnotate,
            anonymousUserName: this.localized.anonymousUserName
        });

        // Set up mobile annotations dialog
        if (this.isMobile) {
            this.setupMobileDialog();
        }

        // Get applicable annotation mode controllers
        const { CONTROLLERS } = this.options.annotator || {};
        this.modeControllers = CONTROLLERS || {};
        this.modeButtons = this.options.modeButtons;
        Object.keys(this.modeControllers).forEach((type) => {
            const controller = this.modeControllers[type];
            controller.init({
                container: this.container,
                annotatedElement: this.annotatedElement,
                mode: type,
                modeButton: this.modeButtons[type],
                header: this.options.header,
                permissions: this.permissions,
                annotator: this
            });

            this.handleControllerEvents = this.handleControllerEvents.bind(this);
            controller.addListener('annotationcontrollerevent', this.handleControllerEvents);
        });

        this.setScale(initialScale);
        this.setupAnnotations();
        this.showAnnotations();
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
     * Fetches and shows saved annotations.
     *
     * @return {void}
     */
    showAnnotations() {
        // Show annotations after we've generated an in-memory map
        this.fetchAnnotations().then(this.renderAnnotations);
    }

    /**
     * Hides annotations.
     *
     * @return {void}
     */
    hideAnnotations() {
        Object.keys(this.threads).forEach((pageNum) => {
            this.hideAnnotationsOnPage(pageNum);
        });
    }

    /**
     * Hides annotations on a specified page.
     *
     * @param {number} pageNum - Page number
     * @return {void}
     */
    hideAnnotationsOnPage(pageNum) {
        if (!this.threads) {
            return;
        }

        const pageThreads = this.threads[pageNum] || {};
        Object.keys(pageThreads).forEach((threadID) => {
            const thread = pageThreads[threadID];
            thread.hide();
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
     * @param {Annotation[]} annotations - Annotations in thread
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
        this.threads = {};
        this.bindDOMListeners();
        this.bindCustomListenersOnService(this.annotationService);
        this.addListener(ANNOTATOR_EVENT.scale, this.scaleAnnotations);
    }

    /**
     * Sets up the shared mobile dialog element.
     *
     * @protected
     * @return {void}
     */
    setupMobileDialog() {
        // Generate HTML of dialog
        const mobileDialogEl = document.createElement('div');
        mobileDialogEl.setAttribute('data-type', DATA_TYPE_ANNOTATION_DIALOG);
        mobileDialogEl.classList.add(CLASS_MOBILE_ANNOTATION_DIALOG);
        mobileDialogEl.classList.add(CLASS_ANNOTATION_DIALOG);
        mobileDialogEl.classList.add(CLASS_HIDDEN);
        mobileDialogEl.id = ID_MOBILE_ANNOTATION_DIALOG;

        mobileDialogEl.innerHTML = `
            <div class="${CLASS_MOBILE_DIALOG_HEADER}">
                <button class="${CLASS_DIALOG_CLOSE}">${ICON_CLOSE}</button>
            </div>`.trim();

        this.container.appendChild(mobileDialogEl);
    }

    /**
     * Fetches persisted annotations, creates threads as needed, and generates
     * an in-memory map of page to threads.
     *
     * @protected
     * @return {Promise} Promise for fetching saved annotations
     */
    fetchAnnotations() {
        this.threads = {};

        // Do not load any pre-existing annotations if the user does not have
        // the correct permissions
        if (!this.permissions.canViewAllAnnotations && !this.permissions.canViewOwnAnnotations) {
            return Promise.resolve(this.threads);
        }

        return this.annotationService.getThreadMap(this.fileVersionId).then((threadMap) => {
            // Generate map of page to threads
            Object.keys(threadMap).forEach((threadID) => {
                const annotations = threadMap[threadID];
                const firstAnnotation = annotations[0];

                if (!firstAnnotation || !this.isModeAnnotatable(firstAnnotation.type)) {
                    return;
                }

                // Bind events on valid annotation thread
                const thread = this.createAnnotationThread(annotations, firstAnnotation.location, firstAnnotation.type);
                const controller = this.modeControllers[firstAnnotation.type];
                controller.registerThread(thread);
            });

            this.emit(ANNOTATOR_EVENT.fetch);
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
        service.addListener(ANNOTATOR_EVENT.error, this.handleServiceEvents);
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
        service.removeListener(ANNOTATOR_EVENT.error, this.handleServiceEvents);
    }

    /**
     * Returns whether or not annotator is in the specified annotation mode.
     *
     * @protected
     * @param {string} currentMode - Current annotation mode
     * @return {boolean} Whether or not in the specified annotation mode
     */
    getCurrentAnnotationMode() {
        return Object.keys(this.modeControllers).filter((mode) => {
            const controller = this.modeControllers[mode];
            return controller.isModeEnabled();
        })[0];
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
    renderAnnotations() {
        Object.keys(this.threads).forEach((pageNum) => {
            this.renderAnnotationsOnPage(pageNum);
        });
    }

    /**
     * Renders annotations from memory for a specified page.
     *
     * @private
     * @param {number} pageNum - Page number
     * @return {void}
     */
    renderAnnotationsOnPage(pageNum) {
        if (!this.threads) {
            return;
        }

        const pageThreads = this.threads[pageNum] || {};
        Object.keys(pageThreads).forEach((threadID) => {
            const thread = pageThreads[threadID];
            if (!this.isModeAnnotatable(thread.type)) {
                return;
            }

            thread.show();
        });
    }

    /**
     * Rotates annotations. Hides point annotation mode button if rotated
     *
     * @private
     * @param {number} [rotationAngle] - current angle image is rotated
     * @param {number} [pageNum] - Page number
     * @return {void}
     */
    rotateAnnotations(rotationAngle = 0, pageNum = 0) {
        // Only render a specific page's annotations unless no page number
        // is specified
        if (pageNum) {
            this.renderAnnotationsOnPage(pageNum);
        } else {
            this.renderAnnotations();
        }

        // Only show/hide point annotation button if user has the
        // appropriate permissions
        const controller = this.modeControllers[TYPES.point];
        if (!this.permissions.canAnnotate || !controller) {
            return;
        }

        // Hide create annotations button if image is rotated
        const pointButtonSelector = this.modeButtons[TYPES.point].selector;
        const pointAnnotateButton = controller.getModeButton(pointButtonSelector);
        if (rotationAngle !== 0) {
            annotatorUtil.hideElement(pointAnnotateButton);
        } else {
            annotatorUtil.showElement(pointAnnotateButton);
        }
    }

    /**
     * Returns whether or not the current annotation mode is enabled for
     * the current viewer/annotator.
     *
     * @private
     * @param {Object} file - File
     * @return {boolean} Whether or not the annotation mode is enabled
     */
    getAnnotationPermissions(file) {
        const permissions = file.permissions || {};
        this.permissions = {
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
        this.rotateAnnotations(data.rotationAngle, data.pageNum);
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

        Object.values(this.threads).forEach((pageThreads) => {
            if (threadID in pageThreads) {
                const thread = pageThreads[threadID];
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
    handleServiceEvents(data) {
        let errorMessage = '';
        switch (data.reason) {
            case 'read':
                errorMessage = this.localized.loadError;
                break;
            case 'create':
                errorMessage = this.localized.createError;
                this.showAnnotations();
                break;
            case 'delete':
                errorMessage = this.localized.deleteError;
                this.showAnnotations();
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
     * Handle events emitted by the annotaiton service
     *
     * @private
     * @param {Object} [data] - Annotation service event data
     * @param {string} [data.event] - Annotation service event
     * @param {string} [data.data] -
     * @return {void}
     */
    handleControllerEvents(data) {
        let opt = { page: 1, pageThreads: {} };
        const headerSelector = data.data ? data.data.headerSelector : '';
        switch (data.event) {
            case 'togglemode':
                this.toggleAnnotationMode(data.mode);
                break;
            case ANNOTATOR_EVENT.modeEnter:
                this.emit(data.event, { mode: data.mode, headerSelector });
                this.unbindDOMListeners();
                break;
            case ANNOTATOR_EVENT.modeExit:
                this.emit(data.event, { mode: data.mode, headerSelector });
                this.bindDOMListeners();
                break;
            case 'registerthread':
                opt = annotatorUtil.addThreadToMap(data.data, this.threads);
                this.threads[opt.page] = opt.pageThreads;
                this.emit(data.event, data.data);
                break;
            case 'unregisterthread':
                opt = annotatorUtil.removeThreadFromMap(data.data, this.threads);
                this.threads[opt.page] = opt.pageThreads;
                this.emit(data.event, data.data);
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
