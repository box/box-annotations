// @flow
import rbush from 'rbush';
import EventEmitter from 'events';
import noop from 'lodash/noop';

import { insertTemplate, replaceHeader, hasValidBoundaryCoordinates, shouldDisplayMobileUI } from '../util';
import {
    CLASS_HIDDEN,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    CLASS_ANNNOTATION_MODE_BACKGROUND,
    SELECTOR_BOX_PREVIEW_BASE_HEADER,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    BORDER_OFFSET,
    STATES
} from '../constants';
import AnnotationAPI from '../api/AnnotationAPI';

class AnnotationModeController extends EventEmitter {
    /** @property {Object} - Object containing annotation threads */
    annotations: Object = {};

    /** @property {Array} - The array of annotation handlers */
    handlers: Array<any> = [];

    /** @property {string} - File version ID */
    fileVersionId: string;

    /** @property {HTMLElement} - Container of the annotatedElement */
    container: HTMLElement;

    /** @property {HTMLElement} - Annotated HTML DOM element */
    annotatedElement: HTMLElement;

    /** @property {HTMLElement} - Header HTML DOM element */
    headerElement: HTMLElement;

    /** @property {HTMLElement} - Annotation mode button HTML DOM element */
    buttonEl: HTMLElement;

    /** @property {Object} - Annotation mode button selector and title */
    modeButton: Object;

    /** @property {AnnotationType} - Mode for annotation controller */
    mode: AnnotationType;

    /** @property {string} - Mode for annotation controller */
    annotatorType: string;

    /** @property {Object} */
    permissions: BoxItemPermissions;

    /** @property {Object} - Localized strings */
    localized: Object;

    /** @property {boolean} */
    hasTouch: boolean = false;

    /** @property {boolean} */
    isMobile: boolean = false;

    /** @property {string} */
    locale: string = 'en-US';

    /** @property {AnnotationAPI} */
    api: AnnotationAPI;

    /** @property {Function} */
    getLocation: Function = noop;

    /** @property {AnnotationType} */
    annotationType: AnnotationType;

    /** @property {boolean} */
    hadPendingThreads: boolean;

    /** @property {string} */
    visibleThreadID: ?string;

    /** @property {string} */
    pendingThreadID: ?string;

    /** @property {HTMLElement} */
    headerElement: HTMLElement;

    /** @property {AnnotationThread} */
    currentThread: ?AnnotationThread;

    constructor(annotatorType: string): void {
        super();
        this.annotatorType = annotatorType;

        // $FlowFixMe
        this.unregisterThread = this.unregisterThread.bind(this);
    }

    /**
     * Initializes mode controller.
     *
     * @param {Object} data - Options for constructing a controller
     * @return {void}
     */
    init(data: Object): void {
        this.container = data.container;
        this.headerElement = data.headerElement;
        this.annotatedElement = data.annotatedElement;
        this.mode = data.mode;
        this.fileVersionId = data.fileVersionId;
        this.permissions = data.permissions;
        this.localized = data.localized || {};
        this.hasTouch = data.options ? data.options.hasTouch : false;
        this.locale = data.options ? data.options.locale : 'en-US';
        this.getLocation = data.getLocation;

        this.api = new AnnotationAPI({
            apiHost: data.apiHost,
            fileId: data.fileId,
            token: data.token,
            anonymousUserName: data.localized.anonymousUserName,
            permissions: this.permissions
        });
        this.api.addListener(CONTROLLER_EVENT.error, this.handleAPIErrors);

        if (data.modeButton && this.permissions.can_annotate) {
            this.modeButton = data.modeButton;
            this.showButton();
        }
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy(): void {
        Object.keys(this.annotations).forEach((pageNum) => {
            const pageThreads = this.annotations[pageNum].all() || [];
            pageThreads.forEach(this.unregisterThread);
        });

        if (this.buttonEl) {
            this.buttonEl.removeEventListener('click', this.toggleMode);
        }
        this.api.removeListener(CONTROLLER_EVENT.error, this.handleAPIErrors);
    }

    /**
     * Gets the annotation button element.
     *
     * @param {string} annotatorSelector - Class selector for a custom annotation button.
     * @return {HTMLElement|null} Annotate button element or null if the selector did not find an element.
     */
    getButton(annotatorSelector: string): HTMLElement {
        // $FlowFixMe
        return this.container.querySelector(annotatorSelector);
    }

    /**
     * Shows the annotate button for the specified mode
     *
     * @return {void}
     */
    showButton(): void {
        if (!this.permissions.can_annotate) {
            return;
        }

        this.buttonEl = this.getButton(this.modeButton.selector);
        // $FlowFixMe
        if (this.buttonEl) {
            this.buttonEl.title = this.modeButton.title;
            this.buttonEl.classList.remove(CLASS_HIDDEN);

            // $FlowFixMe
            this.toggleMode = this.toggleMode.bind(this);
            // $FlowFixMe
            this.buttonEl.addEventListener('click', this.toggleMode);
        }
    }

    /**
     * Hides the annotate button for the specified mode
     *
     * @return {void}
     */
    hideButton() {
        if (!this.permissions.can_annotate || !this.modeButton) {
            return;
        }

        this.buttonEl = this.getButton(this.modeButton.selector);
        if (this.buttonEl) {
            this.buttonEl.classList.add(CLASS_HIDDEN);
        }
    }

    /**
     * Toggles annotation modes on and off. When an annotation mode is
     * on, annotation threads will be created at that location.
     *
     * @return {void}
     */
    toggleMode(): void {
        this.destroyPendingThreads();

        // No specific mode available for annotation type
        if (!this.modeButton) {
            return;
        }

        // Exit any other annotation mode
        this.emit(CONTROLLER_EVENT.toggleMode);
    }

    /**
     * Disables the specified annotation mode
     *
     * @return {void}
     */
    exit(): void {
        if (this.currentThread) {
            this.currentThread.unmountPopover();
        }

        this.emit(CONTROLLER_EVENT.exit, { mode: this.mode });
        replaceHeader(this.headerElement, SELECTOR_BOX_PREVIEW_BASE_HEADER);

        this.destroyPendingThreads();

        this.annotatedElement.classList.remove(CLASS_ANNOTATION_MODE);
        this.annotatedElement.classList.remove(CLASS_ANNNOTATION_MODE_BACKGROUND);

        this.buttonEl.classList.remove(CLASS_ACTIVE);

        this.unbindListeners(); // Disable mode
        this.emit(CONTROLLER_EVENT.bindDOMListeners);
        this.hadPendingThreads = false;
        this.currentThread = undefined;
    }

    /**
     * Enables the specified annotation mode
     *
     * @return {void}
     */
    enter(): void {
        this.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
        this.annotatedElement.classList.add(CLASS_ANNNOTATION_MODE_BACKGROUND);

        this.buttonEl.classList.add(CLASS_ACTIVE);

        this.emit(CONTROLLER_EVENT.enter, { mode: this.mode });
        this.emit(CONTROLLER_EVENT.unbindDOMListeners); // Disable other annotations
        this.bindListeners(); // Enable mode
    }

    /**
     * Returns whether or not the current annotation mode is enabled
     *
     * @return {boolean} Whether or not the annotation mode is enabled
     */
    isEnabled(): boolean {
        return this.buttonEl ? this.buttonEl.classList.contains(CLASS_ACTIVE) : false;
    }

    /**
     * Bind the mode listeners and store each handler for future unbinding
     *
     * @return {void}
     */
    bindListeners(): void {
        const currentHandlerIndex = this.handlers.length;
        this.setupHandlers();

        for (let index = currentHandlerIndex; index < this.handlers.length; index++) {
            const handler = this.handlers[index];
            const types = handler.type instanceof Array ? handler.type : [handler.type];

            types.forEach((eventName) =>
                handler.eventObj.addEventListener(eventName, handler.func, handler.useCapture)
            );
        }
    }

    /**
     * Unbind the previously bound mode listeners
     *
     * @return {void}
     */
    unbindListeners(): void {
        while (this.handlers.length > 0) {
            const handler = this.handlers.pop();
            const types = handler.type instanceof Array ? handler.type : [handler.type];

            types.forEach((eventName) => {
                handler.eventObj.removeEventListener(eventName, handler.func, handler.useCapture);
            });
        }
    }

    /**
     * Gets thread params for the new annotation thread
     *
     * @param {Annotation} annotation - Annotation
     * @return {Object} Params to create annotation thread
     */
    getThreadParams(annotation: Annotation): ?Object {
        return {
            annotatedElement: this.annotatedElement,
            api: this.api,
            container: this.container,
            fileVersionId: this.fileVersionId,
            isMobile: shouldDisplayMobileUI(this.container),
            hasTouch: this.hasTouch,
            headerHeight: this.headerElement.clientHeight,
            ...annotation
        };
    }

    /**
     * Instantiates the appropriate annotation thread for the current viewer
     *
     * @param {Object} params - Annotation thread params
     * @return {AnnotationThread|null} Annotation thread instance or null
     */
    /* eslint-disable no-unused-vars */
    instantiateThread(params: Object): AnnotationThread {
        /* eslint-enable no-unused-vars */
        throw new Error('Implement me!');
    }

    /**
     * Register a thread with the controller so that the controller can keep track of relevant threads
     *
     * @param {Annotation} annotation - Annotation
     * @return {AnnotationThread} registered thread
     */
    registerThread(annotation: Annotation): AnnotationThread {
        let thread;

        const threadParams = this.getThreadParams(annotation);
        if (!threadParams) {
            return thread;
        }

        thread = this.instantiateThread(threadParams);
        if (!thread || !hasValidBoundaryCoordinates(thread)) {
            return thread;
        }

        const page = thread.location.page || 1; // Defaults to page 1 if thread has no page'
        if (!(page in this.annotations)) {
            /* eslint-disable new-cap */
            this.annotations[page] = new rbush();
            /* eslint-enable new-cap */
        }
        this.annotations[page].insert(thread);

        let threadEventHandler = (data) => this.handleThreadEvents(thread, data);
        threadEventHandler = threadEventHandler.bind(this);
        thread.addListener('threadevent', threadEventHandler);

        this.emit(CONTROLLER_EVENT.register, thread);
        return thread;
    }

    /**
     * Unregister a previously registered thread
     *
     * 
     * @param {AnnotationThread} thread - The thread to unregister with the controller
     * @param {Object} annotation - The annotation with comments to register with the controller
     * @return {void}
     */
    unregisterThread(thread: AnnotationThread): void {
        if (!thread || !thread.location || !thread.location.page || !this.annotations[thread.location.page]) {
            return;
        }

        this.annotations[thread.location.page].remove(thread);
        this.emit(CONTROLLER_EVENT.unregister, thread);
        thread.removeListener('threadevent', this.handleThreadEvents);
    }

    /**
     * Apply predicate method to every thread on the specified page
     *
     * @param {Function} func Predicate method to apply on threads
     * @param {string} pageNum Page number
     * @return {void}
     */
    applyActionToPageThreads(func: Function, pageNum: string): void {
        if (!this.annotations[pageNum]) {
            return;
        }

        const pageThreads = this.annotations[pageNum].all() || [];
        pageThreads.forEach(func);
    }

    /**
     * Apply predicate method to every thread on the entire file
     *
     * @param {Function} func Predicate method to apply on threads
     * @return {void}
     */
    applyActionToThreads(func: Function): void {
        Object.keys(this.annotations).forEach((page) => this.applyActionToPageThreads(func, page));
    }

    /**
     * Gets thread specified by threadID
     *
     * @param {string} [threadID] - Thread ID
     * @param {string} [pageNum] - Optional page number
     * @return {AnnotationThread} Annotation thread specified by threadID
     */
    getThreadByID(threadID: ?string, pageNum?: string): ?AnnotationThread {
        let thread = null;
        if (!threadID) {
            return thread;
        }

        if (pageNum) {
            thread = this.doesThreadMatch(threadID, pageNum);
        } else {
            Object.keys(this.annotations).some((page) => {
                // $FlowFixMe
                const matchingThread = this.doesThreadMatch(threadID, page);
                if (matchingThread) {
                    thread = matchingThread;
                }
                return !!matchingThread;
            });
        }

        return thread;
    }

    /**
     * Determines whether a thread matches the specified threadID
     *
     * @param {string} [threadID] - Thread ID
     * @param {string} [pageNum] - Page number
     * @return {AnnotationThread|null} Matching annotation thread or null
     */
    doesThreadMatch(threadID: ?string, pageNum: ?string): ?AnnotationThread {
        let thread = null;
        const pageThreads = this.annotations[pageNum];
        if (!pageThreads) {
            return thread;
        }

        thread = pageThreads.all().filter((t) => {
            return t.threadID === threadID;
        })[0];

        return thread;
    }

    /**
     * Clean up any selected annotations
     * 
     * @return {void}
     */
    removeSelection(): void {}

    /**
     * Set up and return the necessary handlers for the annotation mode
     *
     * @return {Array} An array where each element is an object containing the object that will emit the event,
     *                 the type of events to listen for, and the callback
     */
    setupHandlers(): void {}

    /**
     * Handles annotation thread events and emits them to the viewer
     *
     * @param {AnnotationThread} thread - The thread that emitted the event
     * @param {Object} [data] - Annotation thread event data
     * @param {string} [data.event] - Annotation thread event
     * @param {Object} [data.data] - Annotation thread event data
     * @return {void}
     */
    handleThreadEvents(thread: AnnotationThread, data: Object): void {
        const { event, data: threadData, eventData } = data;

        switch (event) {
            case THREAD_EVENT.save:
            case THREAD_EVENT.cancel:
                this.hadPendingThreads = false;
                this.pendingThreadID = null;
                this.emit(event, threadData);
                break;
            case THREAD_EVENT.show:
                this.visibleThreadID = threadData.threadID;
                break;
            case THREAD_EVENT.hide:
                this.visibleThreadID = null;
                break;
            case THREAD_EVENT.render:
                this.renderPage(eventData);
                break;
            case THREAD_EVENT.delete:
                // Thread should be cleaned up, unbind listeners - we
                // don't do this in annotationdelete listener since thread
                // may still need to respond to error messages
                this.unregisterThread(thread);
                break;
            case THREAD_EVENT.threadDelete:
                // Thread was deleted, remove from thread map
                this.unregisterThread(thread);
                this.emit(event, threadData);
                break;
            case THREAD_EVENT.deleteError:
                this.emit(CONTROLLER_EVENT.error, this.localized.deleteError);
                this.emit(event, threadData);
                break;
            case THREAD_EVENT.createError:
                this.emit(CONTROLLER_EVENT.error, this.localized.createError);
                this.emit(event, threadData);
                break;
            default:
                this.emit(event, threadData);
        }
    }

    /**
     * Creates a handler description object and adds its to the internal handler container.
     * Useful for setupAndGetHandlers.
     *
     * @param {HTMLElement} element - The element to bind the listener to
     * @param {Array|string} type - An array of event types to listen for or the event name to listen for
     * @param {Function} handlerFn - The callback to be invoked when the element emits a specified eventname
     * @param {boolean} [useCapture] - Whether or not to prioritize handler call
     * @return {void}
     */
    pushElementHandler(
        element: HTMLElement,
        type: Array<any> | string,
        handlerFn: Function,
        useCapture: boolean = false
    ): void {
        if (!element) {
            return;
        }

        this.handlers.push({
            eventObj: element,
            func: handlerFn,
            type,
            useCapture
        });
    }

    /**
     * Setups the header for the annotation mode
     *
     * @param {HTMLElement} container - Container element
     * @param {HTMLElement} header - Header to add to DOM
     * @return {void}
     */
    setupHeader(container: HTMLElement, header: HTMLElement): void {
        const baseHeaderEl = container.firstElementChild;
        insertTemplate(container, header, baseHeaderEl);
    }

    /**
     * Renders annotations from memory.
     *
     * @return {void}
     */
    render(): void {
        if (!this.annotations) {
            return;
        }

        Object.keys(this.annotations).forEach((pageNum) => this.renderPage(pageNum));
    }

    /**
     * Renders annotations from memory for a specified page.
     *
     * @param {string} pageNum - Page number
     * @return {void}
     */
    renderPage(pageNum: string) {
        if (!this.annotations || !this.annotations[pageNum]) {
            return;
        }

        const pageThreads = this.annotations[pageNum].all() || [];
        pageThreads.forEach((thread, index) => {
            // Destroy any pending threads that may exist on re-render
            if (thread.state === STATES.pending || thread.id === this.pendingThreadID) {
                this.unregisterThread(thread);
                thread.destroy();
                return;
            }

            thread.reset();
            thread.unmountPopover();

            // Sets the annotatedElement if the thread was fetched before the
            // dependent document/viewer finished loading
            if (!thread.annotatedElement) {
                pageThreads[index].annotatedElement = this.annotatedElement;
            }

            thread.show();
        });
    }

    /**
     * Destroys pending threads.
     *
     * @return {boolean} Whether or not any pending threads existed on the
     * current file
     */
    destroyPendingThreads(): boolean {
        let hadPendingThreads = false;

        Object.keys(this.annotations).forEach((pageNum) => {
            const pageThreads = this.annotations[pageNum].all() || [];
            pageThreads.forEach((thread) => {
                if (thread.state === STATES.pending || thread.id === this.pendingThreadID) {
                    this.unregisterThread(thread);
                    hadPendingThreads = true;
                    this.pendingThreadID = null;
                    thread.destroy();
                }
            });
        });
        return hadPendingThreads;
    }

    /**
     * Find the intersecting threads given a pointer event
     *
     * @param {Event} event The event object containing the pointer information
     * @param {PointLocationInfo} location Annotation location object
     * @return {Array<AnnotationThread>} Array of intersecting annotation threads
     */
    getIntersectingThreads(event: Event, location: PointLocationInfo): Array<AnnotationThread> {
        if (
            !event ||
            !this.annotations ||
            !location ||
            Object.keys(this.annotations).length === 0 ||
            !this.annotations[location.page]
        ) {
            return [];
        }

        const eventBoundary = {
            // $FlowFixMe
            minX: +location.x - BORDER_OFFSET,
            // $FlowFixMe
            minY: +location.y - BORDER_OFFSET,
            // $FlowFixMe
            maxX: +location.x + BORDER_OFFSET,
            // $FlowFixMe
            maxY: +location.y + BORDER_OFFSET
        };

        // Get the threads that correspond to the point that was clicked on
        return this.annotations[location.page].search(eventBoundary);
    }

    /**
     * Handle events emitted by the annotation service
     *
     * @param {Object} [data] - Annotation service event data
     * @param {Event} [data.event] - Annotation service event
     * @param {Object} [data.data] -
     * @return {void}
     */
    handleAPIErrors(data: Object): void {
        let errorMessage = '';
        switch (data.reason) {
            case 'create':
                errorMessage = this.localized.createError;
                this.emit(CONTROLLER_EVENT.load);
                break;
            case 'delete':
                errorMessage = this.localized.deleteError;
                this.emit(CONTROLLER_EVENT.load);
                break;
            case 'authorization':
                errorMessage = this.localized.authError;
                break;
            default:
        }

        if (data.error) {
            /* eslint-disable no-console */
            console.error(CONTROLLER_EVENT.error, data.error);
            /* eslint-enable no-console */
        }

        if (errorMessage) {
            this.emit(CONTROLLER_EVENT.error, errorMessage);
        }
    }

    /**
     * Emits a generic annotator event
     *
     * @emits annotatorevent
     * @param {string} event - Event name
     * @param {Object} [data] - Event data
     * @return {void}
     */
    emit(event: string, data?: Object): boolean {
        super.emit('annotationcontrollerevent', {
            event,
            data,
            mode: this.mode
        });
        return super.emit(event, data);
    }
}

export default AnnotationModeController;
