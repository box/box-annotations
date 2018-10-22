/* eslint-disable no-unused-expressions */
import Annotator from '../Annotator';
import {
    STATES,
    TYPES,
    ANNOTATOR_EVENT,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    SELECTOR_ANNOTATED_ELEMENT,
    SELECTOR_BOX_PREVIEW_HEADER_CONTAINER
} from '../constants';
import AnnotationThread from '../AnnotationThread';
import FileVersionAPI from '../api/FileVersionAPI';
import AnnotationModeController from '../controllers/AnnotationModeController';

jest.mock('../AnnotationThread');
jest.mock('../api/FileVersionAPI');
jest.mock('../controllers/AnnotationModeController');

describe('Annotator', () => {
    let rootElement;
    let annotator;
    let controller;
    let thread;
    let api;
    const html = `<button class="bp-btn-annotate"></button>
    <div class="annotated-element"></div>`;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        thread = new AnnotationThread();
        thread.threadID = '123abc';
        thread.location = { page: 1 };
        thread.type = 'something';
        thread.annotations = [];

        controller = new AnnotationModeController();
        controller.registerThread = jest.fn().mockReturnValue(thread);

        api = new FileVersionAPI();

        const options = {
            annotator: {
                NAME: 'name',
                CONTROLLERS: { something: controller }
            },
            modeButtons: { something: {} }
        };

        annotator = new Annotator({
            container: rootElement,
            api,
            file: {
                file_version: { id: 1 }
            },
            isMobile: false,
            options,
            location: {},
            localizedStrings: {
                anonymousUserName: 'anonymous',
                loadError: 'load error',
                createError: 'create error',
                deleteError: 'delete error',
                authError: 'auth error'
            }
        });
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        annotator.modeButtons = {};
        annotator.modeControllers = {};

        if (typeof annotator.destroy === 'function') {
            annotator.destroy();
            annotator = null;
        }
    });

    describe('init()', () => {
        beforeEach(() => {
            const annotatedEl = rootElement.querySelector(SELECTOR_ANNOTATED_ELEMENT);
            annotator.getAnnotatedEl = jest.fn().mockReturnValue(annotatedEl);
            annotator.annotatedElement = annotatedEl;

            annotator.setScale = jest.fn();
            annotator.setupAnnotations = jest.fn();
            annotator.loadAnnotations = jest.fn();
            annotator.getAnnotationPermissions = jest.fn();

            annotator.permissions = { can_annotate: true };
        });

        it('should set scale and setup annotations', () => {
            annotator.isMobile = false;
            annotator.init(5);
            expect(annotator.setScale).toBeCalledWith(5);
            expect(annotator.setupAnnotations).toBeCalled();
            expect(annotator.loadAnnotations).toBeCalled();
        });

        it('should set the headerElement to the container as a fallback', () => {
            annotator.options.header = 'light';
            annotator.init(5);
            expect(annotator.headerElement).toEqual(document.querySelector(SELECTOR_BOX_PREVIEW_HEADER_CONTAINER));
        });
    });

    describe('loadAnnotations()', () => {
        beforeEach(() => {
            annotator.render = jest.fn();
            annotator.emit = jest.fn();
        });

        it('should fetch and then render annotations', () => {
            annotator.fetchPromise = Promise.resolve();
            annotator.loadAnnotations();
            return annotator.fetchPromise.then(() => {
                expect(annotator.render).toBeCalled();
                expect(annotator.emit).not.toBeCalled();
            });
        });

        it('should emit an error if the annotator fails to fetch and render annotations', () => {
            annotator.fetchPromise = Promise.reject();
            annotator.loadAnnotations();
            return annotator.fetchPromise
                .then(() => {
                    expect(annotator.render).not.toBeCalled();
                })
                .catch((err) => {
                    expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.loadError, err);
                });
        });
    });

    describe('setupAnnotations()', () => {
        it('should initialize thread map and bind DOM listeners', () => {
            annotator.bindDOMListeners = jest.fn();
            annotator.bindCustomListeners = jest.fn();
            annotator.addListener = jest.fn();
            annotator.setupControllers = jest.fn();

            annotator.setupAnnotations();

            expect(annotator.bindDOMListeners).toBeCalled();
            expect(annotator.bindCustomListeners).toBeCalled();
            expect(annotator.setupControllers).toBeCalled();
        });
    });

    describe('setupControllers()', () => {
        it('should instantiate controllers for enabled types', () => {
            annotator.modeControllers = { something: controller };
            annotator.options = { modeButtons: { something: {} } };

            annotator.setupControllers();
            expect(controller.init).toBeCalled();
            expect(controller.addListener).toBeCalledWith('annotationcontrollerevent', expect.any(Function));
        });
    });

    describe('once annotator is initialized', () => {
        beforeEach(() => {
            const annotatedEl = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
            annotator.annotatedElement = annotatedEl;
            annotator.getAnnotatedEl = jest.fn().mockReturnValue(annotatedEl);
            annotator.setupAnnotations = jest.fn();
            annotator.loadAnnotations = jest.fn();
            annotator.init();
            annotator.setupControllers();
        });

        describe('destroy()', () => {
            it('should unbind custom listeners on thread and unbind DOM listeners', () => {
                annotator.unbindDOMListeners = jest.fn();
                annotator.unbindCustomListeners = jest.fn();
                annotator.removeListener = jest.fn();

                annotator.destroy();

                expect(annotator.unbindDOMListeners).toBeCalled();
                expect(annotator.unbindCustomListeners).toBeCalled();
            });
        });

        describe('render()', () => {
            it('should call hide on each thread in map', () => {
                annotator.modeControllers = {
                    type: {
                        render: jest.fn()
                    },
                    type2: {
                        render: jest.fn()
                    }
                };

                annotator.render();
                expect(annotator.modeControllers.type.render).toBeCalled();
                expect(annotator.modeControllers.type2.render).toBeCalled();
            });
        });

        describe('renderPage()', () => {
            it('should call hide on each thread in map on page 1', () => {
                annotator.modeControllers = {
                    type: {
                        renderPage: jest.fn()
                    },
                    type2: {
                        renderPage: jest.fn()
                    }
                };
                annotator.renderPage(1);
                expect(annotator.modeControllers.type.renderPage).toBeCalledWith(1);
                expect(annotator.modeControllers.type2.renderPage).toBeCalled();
            });
        });

        describe('getAnnotationPermissions()', () => {
            it('should return the appropriate annotation permissions for the file', () => {
                const file = {
                    permissions: {
                        can_annotate: false,
                        can_view_annotations_self: true,
                        can_view_annotations_all: false
                    }
                };
                const permissions = annotator.getAnnotationPermissions(file);
                expect(permissions.can_annotate).toBeFalsy();
                expect(permissions.can_view_annotations_self).toBeTruthy();
                expect(permissions.can_view_annotations_all).toBeFalsy();
            });
        });

        describe('setScale()', () => {
            it('should set a data-scale attribute on the annotated element', () => {
                annotator.setScale(10);
                const annotatedEl = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
                expect(annotatedEl.dataset.scale).toEqual('10');
            });
        });

        describe('fetchAnnotations()', () => {
            const threadMap = {
                someID: [{}, {}],
                someID2: [{}]
            };
            const threadPromise = Promise.resolve(threadMap);

            beforeEach(() => {
                annotator.api.getThreadMap = jest.fn();

                annotator.permissions = {
                    can_view_annotations_all: true,
                    can_view_annotations_self: true
                };
                annotator.emit = jest.fn();
            });

            it('should not fetch existing annotations if the user does not have correct permissions', () => {
                annotator.permissions = {
                    can_view_annotations_all: false,
                    can_view_annotations_self: false
                };

                const result = annotator.fetchAnnotations();
                result.then(() => {
                    expect(result).toBeTruthy();
                    expect(annotator.api.getThreadMap).not.toBeCalled();
                });
            });

            it('should fetch existing annotations if the user can view all annotations', () => {
                // api.getThreadMap = jest.fn().mockReturnValue(threadPromise);
                api.fetchVersionAnnotations = jest.fn().mockResolvedValue({});
                annotator.api = api;
                annotator.permissions = {
                    can_view_annotations_all: false,
                    can_view_annotations_self: true
                };

                const result = annotator.fetchAnnotations();
                result.then(() => {
                    expect(result).toBeTruthy();
                    expect(annotator.threadMap).not.toBeUndefined();
                    expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.fetch);
                });
            });

            it('should fetch existing annotations if the user can view all annotations', () => {
                // api.getThreadMap = jest.fn().mockReturnValue(threadPromise);
                api.fetchVersionAnnotations = jest.fn().mockResolvedValue({});
                annotator.api = api;
                annotator.permissions = {
                    can_view_annotations_all: true,
                    can_view_annotations_self: false
                };

                const result = annotator.fetchAnnotations();
                result.then(() => {
                    expect(result).toBeTruthy();
                    threadPromise.then(() => {
                        expect(annotator.threadMap).not.toBeUndefined();
                        expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.fetch);
                    });
                });
            });
        });

        describe('generateAnnotationMap()', () => {
            let threadMap;

            beforeEach(() => {
                annotator.options = { annotator: {} };
                threadMap = { '123abc': [{ type: 'highlight-comment', location: {} }] };
            });

            it('should do nothing if annotator conf does not exist in options', () => {
                annotator.options = {};
                annotator.generateAnnotationMap(threadMap);
                expect(controller.registerThread).not.toBeCalled();
            });

            it('should register thread if controller exists', () => {
                annotator.isModeAnnotatable = jest.fn().mockReturnValue(true);
                annotator.modeControllers = { 'highlight-comment': controller };
                annotator.generateAnnotationMap(threadMap);
                expect(controller.registerThread).toBeCalled();
            });

            it('should not register a highlight comment thread with a plain highlight for the first annotation', () => {
                annotator.isModeAnnotatable = jest.fn().mockReturnValue(true);
                annotator.modeControllers = { highlight: controller };
                annotator.generateAnnotationMap(threadMap);
                expect(controller.registerThread).not.toBeCalled();
            });
        });

        describe('bindCustomListeners()', () => {
            it('should add an event listener', () => {
                annotator.api.addListener = jest.fn();
                annotator.bindCustomListeners();
                expect(annotator.api.addListener).toBeCalledWith(ANNOTATOR_EVENT.error, expect.any(Function));
            });
        });

        describe('handleServicesErrors()', () => {
            beforeEach(() => {
                annotator.emit = jest.fn();
            });

            it('should emit annotatorerror on error event', () => {
                annotator.handleServicesErrors({ error: {} });
                expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.error, annotator.localized.loadError);
            });
        });

        describe('handleControllerEvents()', () => {
            const mode = 'something';
            const data = { mode };

            beforeEach(() => {
                annotator.emit = jest.fn();
            });

            it('should toggle annotation mode on togglemode', () => {
                annotator.toggleAnnotationMode = jest.fn();
                data.event = CONTROLLER_EVENT.toggleMode;
                annotator.handleControllerEvents(data);
                expect(annotator.toggleAnnotationMode).toBeCalledWith(mode);
            });

            it('should unbind dom listeners and emit message on mode enter', () => {
                annotator.unbindDOMListeners = jest.fn();
                data.event = CONTROLLER_EVENT.enter;
                annotator.handleControllerEvents(data);
                expect(annotator.unbindDOMListeners).toBeCalled();
                expect(annotator.emit).toBeCalledWith(data.event, expect.any(Object));
            });

            it('should bind dom listeners and emit message on mode exit', () => {
                annotator.bindDOMListeners = jest.fn();
                data.event = CONTROLLER_EVENT.exit;
                annotator.handleControllerEvents(data);
                expect(annotator.bindDOMListeners).toBeCalled();
                expect(annotator.emit).toBeCalledWith(data.event, expect.any(Object));
            });

            it('should create a point annotation thread on createThread', () => {
                annotator.createPointThread = jest.fn();
                data.event = CONTROLLER_EVENT.createThread;
                annotator.handleControllerEvents(data);
                expect(annotator.createPointThread).toBeCalledWith(data.data);
            });
        });

        describe('unbindCustomListeners()', () => {
            it('should remove an event listener', () => {
                annotator.api.removeListener = jest.fn();
                annotator.unbindCustomListeners();
                expect(annotator.api.removeListener).toBeCalled();
            });
        });

        describe('getCurrentAnnotationMode()', () => {
            it('should return null if no mode is enabled', () => {
                annotator.modeControllers.something = controller;
                controller.isEnabled = jest.fn().mockReturnValue(false);
                expect(annotator.getCurrentAnnotationMode()).toBeNull();
            });

            it('should return the current annotation mode', () => {
                annotator.modeControllers.something = controller;
                controller.isEnabled = jest.fn().mockReturnValue(true);
                expect(annotator.getCurrentAnnotationMode()).toEqual('something');
            });

            it('should null if no controllers exist', () => {
                annotator.modeControllers = {};
                expect(annotator.getCurrentAnnotationMode()).toBeNull();
            });
        });

        describe('createPointThread()', () => {
            beforeEach(() => {
                annotator.getLocationFromEvent = jest.fn().mockReturnValue({ page: 1 });
                annotator.emit = jest.fn();
                annotator.modeControllers = {
                    point: controller
                };
            });

            it('should do nothing if the point data is invalid', () => {
                annotator.createPointThread({
                    lastPointEvent: {},
                    pendingThreadID: '123abc',
                    commentText: ' '
                });

                annotator.createPointThread({
                    lastPointEvent: {},
                    pendingThreadID: '123abc'
                });

                annotator.createPointThread({
                    lastPointEvent: {},
                    commentText: ' '
                });

                annotator.createPointThread({
                    pendingThreadID: '123abc',
                    commentText: ' '
                });
                expect(annotator.emit).not.toBeCalled();
            });

            it('should do nothing if no location is returned fom the lastPointEvent', () => {
                annotator.getLocationFromEvent = jest.fn().mockReturnValue(null);

                const result = annotator.createPointThread({
                    lastPointEvent: {},
                    pendingThreadID: '123abc',
                    commentText: 'text'
                });
                expect(annotator.emit).not.toBeCalled();
                expect(result).toBeNull();
            });

            it('should do nothing the thread does not exist in the page specified by lastPointEvent', () => {
                controller.getThreadByID = jest.fn().mockReturnValue(null);
                const result = annotator.createPointThread({
                    lastPointEvent: {},
                    pendingThreadID: '123abc',
                    commentText: 'text'
                });
                expect(annotator.emit).not.toBeCalled();
                expect(result).toBeNull();
            });

            it('should create a point annotation thread using lastPointEvent', () => {
                thread.getThreadEventData = jest.fn().mockReturnValue({});
                controller.getThreadByID = jest.fn().mockReturnValue(thread);
                thread.renderAnnotationPopover = jest.fn();
                thread.saveAnnotation = jest.fn();

                const result = annotator.createPointThread({
                    lastPointEvent: {},
                    pendingThreadID: '123abc',
                    commentText: 'text'
                });

                expect(thread.state).toEqual(STATES.active);
                expect(thread.saveAnnotation).toBeCalledWith(TYPES.point, 'text');
                expect(annotator.emit).toBeCalledWith(THREAD_EVENT.threadSave, expect.any(Object));
                expect(result).not.toBeNull();
                expect(thread.renderAnnotationPopover).toBeCalled();
            });
        });

        describe('scrollToAnnotation()', () => {
            it('should do nothing if no threadID is provided', () => {
                annotator.scrollToAnnotation();
                expect(thread.scrollIntoView).not.toBeCalled();
            });

            it('should do nothing if threadID does not exist on page', () => {
                annotator.scrollToAnnotation('wrong');
                expect(thread.scrollIntoView).not.toBeCalled();
            });

            it('should scroll to annotation if threadID exists on page', () => {
                annotator.modeControllers = {
                    type: {
                        getThreadByID: jest.fn().mockReturnValue(thread),
                        threads: { 1: { '123abc': thread } }
                    }
                };
                annotator.scrollToAnnotation(thread.threadID);
                expect(thread.scrollIntoView).toBeCalled();
            });
        });

        describe('scaleAnnotations()', () => {
            it('should set scale and rotate annotations based on the annotated element', () => {
                annotator.setScale = jest.fn();
                annotator.render = jest.fn();

                const data = {
                    scale: 5,
                    rotationAngle: 90,
                    pageNum: 2
                };
                annotator.scaleAnnotations(data);
                expect(annotator.setScale).toBeCalledWith(data.scale);
                expect(annotator.render).toBeCalled();
            });
        });

        describe('toggleAnnotationMode()', () => {
            beforeEach(() => {
                annotator.modeControllers.something = controller;
                annotator.hideAnnotations = jest.fn();
            });

            it('should exit the current mode', () => {
                controller.isEnabled = jest.fn().mockReturnValue(true);
                annotator.toggleAnnotationMode('something');
                expect(annotator.hideAnnotations).toBeCalled();
                expect(controller.exit).toBeCalled();
            });

            it('should enter the specified mode', () => {
                annotator.getCurrentAnnotationMode = jest.fn();
                annotator.toggleAnnotationMode('something');
                expect(annotator.hideAnnotations).toBeCalled();
                expect(controller.enter).toBeCalled();
            });
        });

        describe('handleValidationError()', () => {
            it('should do nothing if a annotatorerror was already emitted', () => {
                annotator.emit = jest.fn();
                annotator.validationErrorEmitted = true;
                annotator.handleValidationError();
                expect(annotator.emit).not.toBeCalledWith(ANNOTATOR_EVENT.error);
                expect(annotator.validationErrorEmitted).toBeTruthy();
            });

            it('should emit annotatorerror on first error', () => {
                annotator.emit = jest.fn();
                annotator.validationErrorEmitted = false;
                annotator.handleValidationError();
                expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.error, expect.any(String));
                expect(annotator.validationErrorEmitted).toBeTruthy();
            });
        });

        describe('emit()', () => {
            it('should pass through the event as well as broadcast it as a annotator event', () => {
                const event = 'someEvent';
                const data = {};
                let annotatorEventOccured = false;
                let eventOccurred = false;

                annotator.addListener('annotatorevent', () => {
                    annotatorEventOccured = true;
                });
                annotator.addListener('someEvent', () => {
                    eventOccurred = true;
                });
                annotator.emit(event, data);

                expect(annotatorEventOccured).toBeTruthy();
                expect(eventOccurred).toBeTruthy();
            });
        });

        describe('isModeAnnotatable()', () => {
            beforeEach(() => {
                annotator.options.annotator = {
                    TYPE: [TYPES.point, 'highlight']
                };
            });

            it('should return false if annotations are not allowed on the current viewer', () => {
                annotator.options.annotator = undefined;
                expect(annotator.isModeAnnotatable(TYPES.point)).toBeFalsy();
            });

            it('should return true if the type is supported by the viewer', () => {
                expect(annotator.isModeAnnotatable(TYPES.point)).toBeTruthy();
            });

            it('should return false if the type is not supported by the viewer', () => {
                expect(annotator.isModeAnnotatable('drawing')).toBeFalsy();
            });
        });
    });
});
