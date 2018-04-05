import rbush from 'rbush';
import EventEmitter from 'events';
import { insertTemplate, isPending, replaceHeader, hasValidBoundaryCoordinates } from '../util';
import {
    CLASS_HIDDEN,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    CLASS_ANNNOTATION_MODE_BACKGROUND,
    SELECTOR_BOX_PREVIEW_BASE_HEADER,
    ANNOTATOR_EVENT,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    TYPES,
    BORDER_OFFSET
} from '../constants';

class AnnotationModeController extends EventEmitter {
    /** @property {Object} - Object containing annotation threads */
    threads = {};

    /** @property {Array} - The array of annotation handlers */
    handlers = [];

    /** @property {HTMLElement} - Container of the annotatedElement */
    container;

    /** @property {HTMLElement} - Annotated HTML DOM element */
    annotatedElement;

    /** @property {string} - Mode for annotation controller */
    mode;

    /**
     * Initializes mode controller.
     *
     * @param {Object} data - Options for constructing a controller
     * @return {void}
     */
    init(data) {
        this.container = data.container;
        this.annotatedElement = data.annotatedElement;
        this.mode = data.mode;
        this.annotator = data.annotator;
        this.permissions = data.permissions || {};
        this.localized = data.localized || {};
        this.hasTouch = data.options ? data.options.hasTouch : false;
        this.isMobile = data.options ? data.options.isMobile : false;

        if (data.modeButton && this.permissions.canAnnotate) {
            this.modeButton = data.modeButton;
            this.showButton();
        }

        this.handleThreadEvents = this.handleThreadEvents.bind(this);
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        Object.keys(this.threads).forEach((pageNum) => {
            const pageThreads = this.threads[pageNum].all() || [];
            pageThreads.forEach(this.unregisterThread.bind(this));
        });

        if (this.buttonEl) {
            this.buttonEl.removeEventListener('click', this.toggleMode);
        }
    }

    /**
     * Gets the annotation button element.
     *
     * @param {string} annotatorSelector - Class selector for a custom annotation button.
     * @return {HTMLElement|null} Annotate button element or null if the selector did not find an element.
     */
    getButton(annotatorSelector) {
        return this.container.querySelector(annotatorSelector);
    }

    /**
     * Shows the annotate button for the specified mode
     *
     * @return {void}
     */
    showButton() {
        if (!this.permissions.canAnnotate) {
            return;
        }

        this.buttonEl = this.getButton(this.modeButton.selector);
        if (this.buttonEl) {
            this.buttonEl.title = this.modeButton.title;
            this.buttonEl.classList.remove(CLASS_HIDDEN);

            this.toggleMode = this.toggleMode.bind(this);
            this.buttonEl.addEventListener('click', this.toggleMode);
        }
    }

    /**
     * Toggles annotation modes on and off. When an annotation mode is
     * on, annotation threads will be created at that location.
     *
     * @return {void}
     */
    toggleMode() {
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
    exit() {
        this.emit(CONTROLLER_EVENT.exit, { mode: this.mode });
        replaceHeader(this.container, SELECTOR_BOX_PREVIEW_BASE_HEADER);

        this.destroyPendingThreads();

        this.annotatedElement.classList.remove(CLASS_ANNOTATION_MODE);
        this.annotatedElement.classList.remove(CLASS_ANNNOTATION_MODE_BACKGROUND);

        this.buttonEl.classList.remove(CLASS_ACTIVE);

        this.unbindListeners(); // Disable mode
        this.emit(CONTROLLER_EVENT.bindDOMListeners);
        this.hadPendingThreads = false;
    }

    /**
     * Enables the specified annotation mode
     *
     * @return {void}
     */
    enter() {
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
    isEnabled() {
        return this.buttonEl ? this.buttonEl.classList.contains(CLASS_ACTIVE) : false;
    }

    /**
     * Bind the mode listeners and store each handler for future unbinding
     *
     * @public
     * @return {void}
     */
    bindListeners() {
        const currentHandlerIndex = this.handlers.length;
        this.setupHandlers();

        for (let index = currentHandlerIndex; index < this.handlers.length; index++) {
            const handler = this.handlers[index];
            const types = handler.type instanceof Array ? handler.type : [handler.type];

            types.forEach((eventName) => handler.eventObj.addEventListener(eventName, handler.func));
        }
    }

    /**
     * Unbind the previously bound mode listeners
     *
     * @public
     * @return {void}
     */
    unbindListeners() {
        while (this.handlers.length > 0) {
            const handler = this.handlers.pop();
            const types = handler.type instanceof Array ? handler.type : [handler.type];

            types.forEach((eventName) => {
                handler.eventObj.removeEventListener(eventName, handler.func);
            });
        }
    }

    /**
     * Register a thread with the controller so that the controller can keep track of relevant threads
     *
     * @public
     * @param {AnnotationThread} thread - The thread to register with the controller
     * @return {void}
     */
    registerThread(thread) {
        if (!thread || !thread.location || !hasValidBoundaryCoordinates(thread)) {
            return;
        }

        const page = thread.location.page || 1; // Defaults to page 1 if thread has no page'
        if (!(page in this.threads)) {
            /* eslint-disable new-cap */
            this.threads[page] = new rbush();
            /* eslint-enable new-cap */
        }
        this.threads[page].insert(thread);

        this.emit(CONTROLLER_EVENT.register, thread);
        thread.addListener('threadevent', (data) => this.handleThreadEvents(thread, data));
    }

    /**
     * Unregister a previously registered thread
     *
     * @public
     * @param {AnnotationThread} thread - The thread to unregister with the controller
     * @return {void}
     */
    unregisterThread(thread) {
        if (!thread || !thread.location || !thread.location.page) {
            return;
        }

        this.threads[thread.location.page].remove(thread);
        this.emit(CONTROLLER_EVENT.unregister, thread);
        thread.removeListener('threadevent', this.handleThreadEvents);
    }

    /**
     * Apply predicate method to every thread on the specified page
     *
     * @private
     * @param {Function} func Predicate method to apply on threads
     * @param {number} pageNum Page number
     * @return {void}
     */
    applyActionToPageThreads(func, pageNum) {
        if (!this.threads[pageNum]) {
            return;
        }

        const pageThreads = this.threads[pageNum].all() || [];
        pageThreads.forEach(func);
    }

    /**
     * Apply predicate method to every thread on the entire file
     *
     * @private
     * @param {Function} func Predicate method to apply on threads
     * @return {void}
     */
    applyActionToThreads(func) {
        Object.keys(this.threads).forEach((page) => this.applyActionToPageThreads(func, page));
    }

    /**
     * Gets thread specified by threadID
     *
     * @private
     * @param {number} threadID - Thread ID
     * @return {AnnotationThread} Annotation thread specified by threadID
     */
    getThreadByID(threadID) {
        let thread = null;
        if (!threadID) {
            return thread;
        }

        Object.keys(this.threads).some((pageNum) => {
            const pageThreads = this.threads[pageNum];
            if (!pageThreads) {
                return !!thread;
            }

            thread = pageThreads.all().filter((t) => {
                return t.threadID === threadID;
            })[0];

            return !!thread;
        });

        return thread;
    }

    /**
     * Clean up any selected annotations
     * @protected
     * @return {void}
     */
    removeSelection() {}

    /**
     * Set up and return the necessary handlers for the annotation mode
     *
     * @protected
     * @return {Array} An array where each element is an object containing the object that will emit the event,
     *                 the type of events to listen for, and the callback
     */
    setupHandlers() {}

    /**
     * Handles annotation thread events and emits them to the viewer
     *
     * @private
     * @param {AnnotationThread} thread - The thread that emitted the event
     * @param {Object} [data] - Annotation thread event data
     * @param {string} [data.event] - Annotation thread event
     * @param {string} [data.data] - Annotation thread event data
     * @return {void}
     */
    handleThreadEvents(thread, data) {
        switch (data.event) {
            case THREAD_EVENT.save:
            case THREAD_EVENT.cancel:
                this.hadPendingThreads = false;
                this.emit(data.event, data.data);
                break;
            case THREAD_EVENT.threadCleanup:
                // Thread should be cleaned up, unbind listeners - we
                // don't do this in annotationdelete listener since thread
                // may still need to respond to error messages
                this.unregisterThread(thread);
                break;
            case THREAD_EVENT.threadDelete:
                // Thread was deleted, remove from thread map
                this.unregisterThread(thread);
                this.emit(data.event, data.data);
                break;
            case THREAD_EVENT.deleteError:
                this.emit(ANNOTATOR_EVENT.error, this.localized.deleteError);
                this.emit(data.event, data.data);
                break;
            case THREAD_EVENT.createError:
                this.emit(ANNOTATOR_EVENT.error, this.localized.createError);
                this.emit(data.event, data.data);
                break;
            default:
                this.emit(data.event, data.data);
        }
    }

    /**
     * Creates a handler description object and adds its to the internal handler container.
     * Useful for setupAndGetHandlers.
     *
     * @protected
     * @param {HTMLElement} element - The element to bind the listener to
     * @param {Array|string} type - An array of event types to listen for or the event name to listen for
     * @param {Function} handlerFn - The callback to be invoked when the element emits a specified eventname
     * @return {void}
     */
    pushElementHandler(element, type, handlerFn) {
        if (!element) {
            return;
        }

        this.handlers.push({
            eventObj: element,
            func: handlerFn,
            type
        });
    }

    /**
     * Setups the header for the annotation mode
     *
     * @protected
     * @param {HTMLElement} container - Container element
     * @param {HTMLElement} header - Header to add to DOM
     * @return {void}
     */
    setupHeader(container, header) {
        const baseHeaderEl = container.firstElementChild;
        insertTemplate(container, header, baseHeaderEl);
    }

    /**
     * Renders annotations from memory.
     *
     * @private
     * @return {void}
     */
    render() {
        if (!this.threads) {
            return;
        }

        Object.keys(this.threads).forEach((pageNum) => {
            this.renderPage(pageNum);
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
        if (!this.threads || !this.threads[pageNum]) {
            return;
        }

        const pageThreads = this.threads[pageNum].all() || [];
        pageThreads.forEach((thread, index) => {
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
     * @private
     * @return {boolean} Whether or not any pending threads existed on the
     * current file
     */
    destroyPendingThreads() {
        let hadPendingThreads = false;

        Object.keys(this.threads).forEach((pageNum) => {
            const pageThreads = this.threads[pageNum].all() || [];
            pageThreads.forEach((thread) => {
                if (isPending(thread.state)) {
                    hadPendingThreads = true;

                    /* eslint-disable no-console */
                    console.error('Pending annotation thread destroyed', thread.threadNumber);
                    /* eslint-enable no-console */

                    thread.destroy();
                } else if (thread.isDialogVisible()) {
                    thread.hideDialog();
                }
            });
        });
        return hadPendingThreads;
    }

    /**
     * Find the intersecting threads given a pointer event
     *
     * @protected
     * @param {Event} event The event object containing the pointer information
     * @return {AnnotationThread[]} Array of intersecting annotation threads
     */
    getIntersectingThreads(event) {
        if (!event || !this.threads || !this.annotator) {
            return [];
        }

        const location = this.annotator.getLocationFromEvent(event, TYPES.point);
        if (!location || Object.keys(this.threads).length === 0 || !this.threads[location.page]) {
            return [];
        }

        const eventBoundary = {
            minX: +location.x - BORDER_OFFSET,
            minY: +location.y - BORDER_OFFSET,
            maxX: +location.x + BORDER_OFFSET,
            maxY: +location.y + BORDER_OFFSET
        };

        // Get the threads that correspond to the point that was clicked on
        return this.threads[location.page].search(eventBoundary);
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
        super.emit(event, data);
        super.emit('annotationcontrollerevent', {
            event,
            data,
            mode: this.mode
        });
    }
}

export default AnnotationModeController;
