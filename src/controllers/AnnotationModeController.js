import EventEmitter from 'events';
import { insertTemplate, isPending, addThreadToMap, removeThreadFromMap } from '../util';
import {
    CLASS_HIDDEN,
    CLASS_ACTIVE,
    CLASS_ANNOTATION_MODE,
    ANNOTATOR_EVENT,
    THREAD_EVENT,
    CONTROLLER_EVENT
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
        Object.keys(this.threads).forEach((page) => {
            const pageThreads = this.threads[page] || {};

            Object.keys(pageThreads).forEach((threadID) => {
                const thread = pageThreads[threadID];
                this.unregisterThread(thread);
            });
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
        this.destroyPendingThreads();
        this.annotatedElement.classList.remove(CLASS_ANNOTATION_MODE);
        if (this.buttonEl) {
            this.buttonEl.classList.remove(CLASS_ACTIVE);
        }

        this.unbindListeners(); // Disable mode
        this.emit(CONTROLLER_EVENT.exit);
        this.hadPendingThreads = false;
    }

    /**
     * Enables the specified annotation mode
     *
     * @return {void}
     */
    enter() {
        this.annotatedElement.classList.add(CLASS_ANNOTATION_MODE);
        if (this.buttonEl) {
            this.buttonEl.classList.add(CLASS_ACTIVE);
        }

        this.emit(CONTROLLER_EVENT.enter); // Disable other annotations
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
        const { page, pageThreads } = addThreadToMap(thread, this.threads);
        this.threads[page] = pageThreads;
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
        const { page, pageThreads } = removeThreadFromMap(thread, this.threads);
        this.threads[page] = pageThreads;
        this.emit(CONTROLLER_EVENT.unregister, thread);
        thread.removeListener('threadevent', this.handleThreadEvents);
    }

    applyActionToThreads(func, pageNum) {
        if (pageNum) {
            const pageThreads = this.threads[pageNum] || {};
            Object.keys(pageThreads).forEach((threadID) => func(pageThreads[threadID]));
            return;
        }

        Object.keys(this.threads).forEach((page) => {
            const pageThreads = this.threads[page] || {};
            Object.keys(pageThreads).forEach((threadID) => func(pageThreads[threadID]));
        });
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
        Object.keys(this.threads).some((page) => {
            const pageThreads = this.threads[page] || {};
            if (threadID in pageThreads) {
                thread = pageThreads[threadID];
            }
            return thread !== null;
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
            // Sets the annotatedElement if the thread was fetched before the
            // dependent document/viewer finished loading
            const thread = pageThreads[threadID];
            if (!thread.annotatedElement) {
                thread.annotatedElement = this.annotatedElement;
            }

            thread.show();
        });
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
     * Destroys pending threads.
     *
     * @private
     * @return {boolean} Whether or not any pending threads existed on the
     * current file
     */
    destroyPendingThreads() {
        let hadPendingThreads = false;

        Object.keys(this.threads).forEach((page) => {
            const pageThreads = this.threads[page] || {};

            Object.keys(pageThreads).forEach((threadID) => {
                const thread = pageThreads[threadID];
                if (isPending(thread.state)) {
                    hadPendingThreads = true;

                    /* eslint-disable no-console */
                    console.error('Pending annotation thread destroyed', thread.threadNumber);
                    /* eslint-enable no-console */

                    thread.destroy();
                }
            });
        });
        return hadPendingThreads;
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
