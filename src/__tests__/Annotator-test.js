/* eslint-disable no-unused-expressions */
import Annotator from '../Annotator';
import * as util from '../util';
import {
    STATES,
    TYPES,
    ANNOTATOR_EVENT,
    THREAD_EVENT,
    CONTROLLER_EVENT,
    SELECTOR_ANNOTATED_ELEMENT
} from '../constants';

let annotator;
let controller;
let thread;
const html = `<button class="bp-btn-annotate"></button>
<div class="annotated-element"></div>`;

describe('Annotator', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        controller = {
            init: jest.fn(),
            addListener: jest.fn(),
            registerThread: jest.fn(),
            isEnabled: jest.fn(),
            getButton: jest.fn(),
            enter: jest.fn(),
            exit: jest.fn(),
            setupSharedDialog: jest.fn(),
            getThreadByID: jest.fn()
        };

        const options = {
            annotator: {
                NAME: 'name',
                CONTROLLERS: { something: controller }
            },
            modeButtons: { something: {} }
        };

        annotator = new Annotator({
            canAnnotate: true,
            container: document,
            annotationService: {},
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

        thread = {
            threadID: '123abc',
            show: jest.fn(),
            hide: jest.fn(),
            addListener: jest.fn(),
            unbindCustomListenersOnThread: jest.fn(),
            removeListener: jest.fn(),
            scrollIntoView: jest.fn(),
            getThreadEventData: jest.fn(),
            showDialog: jest.fn(),
            type: 'something',
            location: { page: 1 }
        };
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
            annotator.setupMobileDialog = jest.fn();
            annotator.getAnnotationPermissions = jest.fn();

            annotator.permissions = { canAnnotate: true };
        });

        it('should set scale and setup annotations', () => {
            annotator.isMobile = false;
            annotator.init(5);
            expect(annotator.setScale).toBeCalledWith(5);
            expect(annotator.setupAnnotations).toBeCalled();
            expect(annotator.loadAnnotations).toBeCalled();
        });

        it('should setup mobile dialog for mobile browsers', () => {
            annotator.isMobile = true;
            annotator.init();
            expect(annotator.setupMobileDialog).toBeCalled();
        });
    });

    describe('setupMobileDialog()', () => {
        it('should generate mobile annotations dialog and append to container', () => {
            annotator.container = {
                appendChild: jest.fn()
            };
            annotator.setupMobileDialog();
            expect(annotator.container.appendChild).toBeCalled();
            expect(annotator.mobileDialogEl.children.length).toEqual(1);
        });
    });

    describe('removeThreadFromSharedDialog()', () => {
        beforeEach(() => {
            util.hideElement = jest.fn();
            util.showElement = jest.fn();
        });

        it('should do nothing if the mobile dialog does not exist or is hidden', () => {
            annotator.removeThreadFromSharedDialog();
            expect(util.hideElement).not.toBeCalled();

            annotator.mobileDialogEl = {
                classList: {
                    contains: jest.fn().mockReturnValue(true)
                },
                removeChild: jest.fn(),
                lastChild: {}
            };
            annotator.removeThreadFromSharedDialog();
            expect(util.hideElement).not.toBeCalled();
        });

        it('should generate mobile annotations dialog and append to container', () => {
            annotator.mobileDialogEl = document.createElement('div');
            annotator.mobileDialogEl.appendChild(document.createElement('div'));

            annotator.removeThreadFromSharedDialog();
            expect(util.hideElement).toBeCalled();
            expect(util.showElement).toBeCalled();
            expect(annotator.mobileDialogEl.children.length).toEqual(0);
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
            return annotator.fetchPromise
                .then(() => {
                    expect(annotator.render).toBeCalled();
                    expect(annotator.emit).not.toBeCalled();
                })
                .catch(() => {
                    sinon.assert.failException;
                });
        });

        it('should emit an error if the annotator fails to fetch and render annotations', () => {
            annotator.fetchPromise = Promise.reject();
            annotator.loadAnnotations();
            return annotator.fetchPromise
                .then(() => {
                    sinon.assert.failException;
                })
                .catch((err) => {
                    expect(annotator.render).not.toBeCalled();
                    expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.loadError, err);
                });
        });
    });

    describe('setupAnnotations()', () => {
        it('should initialize thread map and bind DOM listeners', () => {
            annotator.bindDOMListeners = jest.fn();
            annotator.bindCustomListenersOnService = jest.fn();
            annotator.addListener = jest.fn();
            annotator.setupControllers = jest.fn();

            annotator.setupAnnotations();

            expect(annotator.bindDOMListeners).toBeCalled();
            expect(annotator.bindCustomListenersOnService).toBeCalled();
            expect(annotator.setupControllers).toBeCalled();
            expect(annotator.addListener).toBeCalledWith(ANNOTATOR_EVENT.scale, expect.any(Function));
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

        it('should setup shared point dialog in the point controller', () => {
            annotator.modeControllers = { point: controller };
            annotator.isMobile = true;

            annotator.setupControllers();
            expect(controller.init).toBeCalled();
            expect(controller.setupSharedDialog).toBeCalledWith(annotator.container, {
                isMobile: annotator.isMobile,
                hasTouch: annotator.hasTouch,
                localized: annotator.localized
            });
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
                annotator.unbindCustomListenersOnService = jest.fn();
                annotator.removeListener = jest.fn();

                annotator.destroy();

                expect(annotator.unbindDOMListeners).toBeCalled();
                expect(annotator.unbindCustomListenersOnService).toBeCalled();
                expect(annotator.removeListener).toBeCalledWith(ANNOTATOR_EVENT.scale, expect.any(Function));
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
                expect(permissions.canAnnotate).toBeFalsy();
                expect(permissions.canViewOwnAnnotations).toBeTruthy();
                expect(permissions.canViewAllAnnotations).toBeFalsy();
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
                annotator.annotationService.getThreadMap = jest.fn();

                annotator.permissions = {
                    canViewAllAnnotations: true,
                    canViewOwnAnnotations: true
                };
                annotator.emit = jest.fn();
            });

            it('should not fetch existing annotations if the user does not have correct permissions', () => {
                annotator.permissions = {
                    canViewAllAnnotations: false,
                    canViewOwnAnnotations: false
                };

                const result = annotator.fetchAnnotations();
                result.then(() => {
                    expect(result).toBeTruthy();
                    expect(annotator.annotationService.getThreadMap).not.toBeCalled();
                });
            });

            it('should fetch existing annotations if the user can view all annotations', () => {
                annotator.annotationService.getThreadMap = jest.fn().mockReturnValue(threadPromise);
                annotator.permissions = {
                    canViewAllAnnotations: false,
                    canViewOwnAnnotations: true
                };

                const result = annotator.fetchAnnotations();
                result
                    .then(() => {
                        expect(result).toBeTruthy();
                        expect(annotator.threadMap).not.toBeUndefined();
                        expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.fetch);
                    })
                    .catch(() => {
                        sinon.assert.failException;
                    });
            });

            it('should fetch existing annotations if the user can view all annotations', () => {
                annotator.annotationService.getThreadMap = jest.fn().mockReturnValue(threadPromise);
                annotator.permissions = {
                    canViewAllAnnotations: true,
                    canViewOwnAnnotations: false
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

        describe('generateThreadMap()', () => {
            const threadMap = { '123abc': thread };

            beforeEach(() => {
                const annotation = { location: {}, type: 'highlight' };
                const lastAnnotation = { location: {}, type: 'highlight-comment' };
                util.getFirstAnnotation = jest.fn().mockReturnValue(annotation);
                util.getLastAnnotation = jest.fn().mockReturnValue(lastAnnotation);
                annotator.createAnnotationThread = jest.fn();
            });

            it('should do nothing if annotator conf does not exist in options', () => {
                annotator.options = {};
                annotator.generateThreadMap(threadMap);
                expect(annotator.createAnnotationThread).not.toBeCalled();
            });

            it('should reset and create a new thread map by from annotations fetched from server', () => {
                annotator.options.annotator = { NAME: 'name', TYPE: ['highlight-comment'] };
                annotator.createAnnotationThread = jest.fn().mockReturnValue(thread);
                annotator.generateThreadMap(threadMap);
                expect(annotator.createAnnotationThread).toBeCalled();
            });

            it('should register thread if controller exists', () => {
                annotator.options.annotator = { NAME: 'name', TYPE: ['highlight-comment'] };
                annotator.modeControllers['highlight-comment'] = controller;
                annotator.createAnnotationThread = jest.fn().mockReturnValue(thread);
                annotator.generateThreadMap(threadMap);
                expect(controller.registerThread).toBeCalled();
            });

            it('should not register a highlight comment thread with a plain highlight for the first annotation', () => {
                annotator.options.annotator = { NAME: 'name', TYPE: ['highlight'] };
                annotator.modeControllers['highlight-comment'] = controller;
                annotator.generateThreadMap(threadMap);
                expect(controller.registerThread).not.toBeCalled();
            });
        });

        describe('bindCustomListenersOnService()', () => {
            it('should add an event listener', () => {
                annotator.annotationService.addListener = jest.fn();
                annotator.bindCustomListenersOnService();
                expect(annotator.annotationService.addListener).toBeCalledWith(
                    ANNOTATOR_EVENT.error,
                    expect.any(Function)
                );
            });
        });

        describe('handleServicesErrors()', () => {
            beforeEach(() => {
                annotator.emit = jest.fn();
            });

            it('should emit annotatorerror on read error event', () => {
                annotator.handleServicesErrors({ reason: 'read' });
                expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.error, expect.any(String));
            });

            it('should emit annotatorerror and show annotations on create error event', () => {
                annotator.handleServicesErrors({ reason: 'create' });
                expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.error, expect.any(String));
                expect(annotator.loadAnnotations).toBeCalled();
            });

            it('should emit annotatorerror and show annotations on delete error event', () => {
                annotator.handleServicesErrors({ reason: 'delete' });
                expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.error, expect.any(String));
                expect(annotator.loadAnnotations).toBeCalled();
            });

            it('should emit annotatorerror on authorization error event', () => {
                annotator.handleServicesErrors({ reason: 'authorization' });
                expect(annotator.emit).toBeCalledWith(ANNOTATOR_EVENT.error, expect.any(String));
            });

            it('should not emit annotatorerror when event does not match', () => {
                annotator.handleServicesErrors({ reason: 'no match' });
                expect(annotator.emit).not.toBeCalled();
            });
        });

        describe('handleControllerEvents()', () => {
            const mode = 'something';
            const data = { mode };

            beforeEach(() => {
                annotator.emit = jest.fn();
            });

            it('should reset mobile annotation dialog on resetMobileDialog', () => {
                annotator.removeThreadFromSharedDialog = jest.fn();
                data.event = CONTROLLER_EVENT.resetMobileDialog;
                annotator.handleControllerEvents(data);
                expect(annotator.removeThreadFromSharedDialog).toBeCalled();
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

        describe('unbindCustomListenersOnService()', () => {
            it('should remove an event listener', () => {
                annotator.annotationService.removeListener = jest.fn();
                annotator.unbindCustomListenersOnService();
                expect(annotator.annotationService.removeListener).toBeCalled();
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
                thread.dialog = {
                    postAnnotation: jest.fn(),
                    hasComments: false
                };

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

                const result = annotator.createPointThread({
                    lastPointEvent: {},
                    pendingThreadID: '123abc',
                    commentText: 'text'
                });

                expect(thread.dialog.hasComments).toBeTruthy();
                expect(thread.state).toEqual(STATES.hover);
                expect(thread.dialog.postAnnotation).toBeCalledWith('text');
                expect(annotator.emit).toBeCalledWith(THREAD_EVENT.threadSave, expect.any(Object));
                expect(result).not.toBeNull();
                expect(thread.showDialog).toBeCalled();
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
