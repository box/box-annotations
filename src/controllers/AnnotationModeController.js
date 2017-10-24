import EventEmitter from 'events';
import { insertTemplate, isPending, addThreadToMap, removeThreadFromMap } from '../annotatorUtil';
import {
    CLASS_HIDDEN,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    ANNOTATOR_EVENT,
    THREAD_EVENT
} from '../annotationConstants';

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

    init(data) {
        this.container = data.container;
        this.annotatedElement = data.annotatedElement;
        this.mode = data.mode;
        this.annotator = data.annotator;
        this.permissions = data.permissions;

        if (data.modeButton) {
            this.modeButton = data.modeButton;
            this.toggleAnnotationHandler = this.toggleAnnotationHandler.bind(this);
            this.buttonEl = this.getModeButton(this.modeButton.selector);
            this.buttonEl.addEventListener('click', this.toggleAnnotationHandler);
            this.showModeButton();
        }

        this.handleThreadEvents = this.handleThreadEvents.bind(this);
    }

    destroy() {
        Object.keys(this.threads).forEach((page) => {
            const pageThreads = this.threads[page] || {};

            Object.keys(pageThreads).forEach((threadID) => {
                const thread = pageThreads[threadID];
                this.unregisterThread(thread);
            });
        });

        if (this.buttonEl) {
            this.buttonEl.removeEventListener('click', this.toggleAnnotationHandler);
        }
    }

    /**
     * Gets the annotation button element.
     *
     * @param {string} annotatorSelector - Class selector for a custom annotation button.
     * @return {HTMLElement|null} Annotate button element or null if the selector did not find an element.
     */
    getModeButton(annotatorSelector) {
        return this.container.querySelector(annotatorSelector);
    }

    /**
     * Shows the annotate button for the specified mode
     *
     * @return {void}
     */
    showModeButton() {
        if (!this.permissions.canAnnotate) {
            return;
        }

        const annotateButtonEl = this.container.querySelector(this.modeButton.selector);
        if (annotateButtonEl) {
            annotateButtonEl.title = this.modeButton.title;
            annotateButtonEl.classList.remove(CLASS_HIDDEN);

            annotateButtonEl.addEventListener('click', this.toggleAnnotationHandler);
        }
    }

    /**
     * Toggles annotation modes on and off. When an annotation mode is
     * on, annotation threads will be created at that location.
     *
     * @return {void}
     */
    toggleAnnotationHandler() {
        this.destroyPendingThreads();

        // No specific mode available for annotation type
        if (!this.modeButton) {
            return;
        }

        // Exit any other annotation mode
        this.emit('exitannotationmodes');
    }

    /**
     * Disables the specified annotation mode
     *
     * @return {void}
     */
    disableMode() {
        this.destroyPendingThreads();
        this.annotatedElement.classList.remove(CLASS_ANNOTATION_MODE);
        if (this.buttonEl) {
            this.buttonEl.classList.remove(CLASS_ACTIVE);
        }

        this.unbindModeListeners(); // Disable mode
        this.emit('binddomlisteners');
    }

    /**
     * Enables the specified annotation mode
     *
     * @return {void}
     */
    enableMode() {
        this.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
        if (this.buttonEl) {
            this.buttonEl.classList.add(CLASS_ACTIVE);
        }

        this.emit('unbinddomlisteners'); // Disable other annotations
        this.bindModeListeners(); // Enable mode
    }

    isModeEnabled() {
        return this.buttonEl.classList.contains(CLASS_ACTIVE);
    }

    /**
     * Bind the mode listeners and store each handler for future unbinding
     *
     * @public
     * @return {void}
     */
    bindModeListeners() {
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
    unbindModeListeners() {
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
        const { page, pageThreads } = addThreadToMap(thread, this.threads);
        this.threads[page] = pageThreads;
        this.emit('registerthread', thread);
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
        const { page, pageThreads } = removeThreadFromMap(thread, this.threads);
        this.threads[page] = pageThreads;
        this.emit('unregisterthread', thread);
        thread.removeListener('threadevent', this.handleThreadEvents);
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
        Object.keys(this.threads).forEach((page) => {
            const pageThreads = this.threads[page] || {};
            if (threadID in pageThreads) {
                thread = pageThreads[threadID];
            }
        });

        return thread;
    }

    /**
     * Clean up any selected annotations
     *
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
    /* eslint-enable no-unused-vars */

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
     * Destroys pending threads.
     *
     * @private
     * @return {boolean} Whether or not any pending threads existed on the
     * current file
     */
    destroyPendingThreads() {
        let hasPendingThreads = false;

        Object.keys(this.threads).forEach((page) => {
            const pageThreads = this.threads[page] || {};

            Object.keys(pageThreads).forEach((threadID) => {
                const thread = pageThreads[threadID];
                if (isPending(thread.state)) {
                    hasPendingThreads = true;
                    thread.destroy();
                }
            });
        });
        return hasPendingThreads;
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
