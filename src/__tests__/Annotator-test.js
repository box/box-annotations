/* eslint-disable no-unused-expressions */
import EventEmitter from 'events';
import Annotator from '../Annotator';
import * as util from '../util';
import AnnotationService from '../AnnotationService';
import {
    STATES,
    TYPES,
    CLASS_ANNOTATION_DRAW_MODE,
    CLASS_ANNOTATION_MODE,
    CLASS_ACTIVE,
    CLASS_HIDDEN,
    SELECTOR_ANNOTATION_BUTTON_DRAW_POST,
    SELECTOR_ANNOTATION_BUTTON_DRAW_UNDO,
    SELECTOR_ANNOTATION_BUTTON_DRAW_REDO,
    SELECTOR_ANNOTATION_DRAWING_HEADER,
    SELECTOR_BOX_PREVIEW_BASE_HEADER,
    ANNOTATOR_EVENT,
    THREAD_EVENT,
    CONTROLLER_EVENT
} from '../constants';

const SELECTOR_ANNOTATED_ELEMENT = '.annotated-element';

let annotator;
let stubs = {};
const sandbox = sinon.sandbox.create();

describe('Annotator', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('__tests__/Annotator-test.html');

        stubs.controller = {
            init: () => {},
            addListener: () => {},
            registerThread: () => {},
            isEnabled: () => {},
            getButton: () => {},
            enter: () => {},
            exit: () => {},
            setupSharedDialog: () => {},
            getThreadByID: () => {}
        };
        stubs.controllerMock = sandbox.mock(stubs.controller);

        const options = {
            annotator: {
                NAME: 'name',
                CONTROLLERS: { 'something': stubs.controller }
            },
            modeButtons: { 'something': {} }
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
                authError: 'auth error',
            }
        });

        stubs.thread = {
            threadID: '123abc',
            show: () => {},
            hide: () => {},
            addListener: () => {},
            unbindCustomListenersOnThread: () => {},
            removeListener: () => {},
            scrollIntoView: () => {},
            getThreadEventData: () => {},
            showDialog: () => {},
            type: 'something',
            location: { page: 1 }
        };
        stubs.threadMock = sandbox.mock(stubs.thread);

        stubs.thread2 = {
            threadID: '456def',
            show: () => {},
            hide: () => {},
            addListener: () => {},
            unbindCustomListenersOnThread: () => {},
            removeAllListeners: () => {},
            type: 'something',
            location: { page: 2 }
        };
        stubs.threadMock2 = sandbox.mock(stubs.thread2);

        stubs.thread3 = {
            threadID: '789ghi',
            show: () => {},
            hide: () => {},
            addListener: () => {},
            unbindCustomListenersOnThread: () => {},
            removeAllListeners: () => {},
            type: 'something',
            location: { page: 2 }
        };
        stubs.threadMock3 = sandbox.mock(stubs.thread3);
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        annotator.modeButtons = {};
        annotator.modeControllers = {};

        if (typeof annotator.destroy === 'function') {
            annotator.destroy();
            annotator = null;
        }

        stubs = {};
    });

    describe('init()', () => {
        beforeEach(() => {
            const annotatedEl = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
            sandbox.stub(annotator, 'getAnnotatedEl').returns(annotatedEl);
            annotator.annotatedElement = annotatedEl;

            stubs.scale = sandbox.stub(annotator, 'setScale');
            stubs.setup = sandbox.stub(annotator, 'setupAnnotations');
            stubs.show = sandbox.stub(annotator, 'loadAnnotations');
            stubs.setupMobileDialog = sandbox.stub(annotator, 'setupMobileDialog');
            stubs.getPermissions = sandbox.stub(annotator, 'getAnnotationPermissions');

            annotator.permissions = { canAnnotate: true };
        });

        it('should set scale and setup annotations', () => {
            annotator.init(5);
            expect(stubs.scale).to.be.calledWith(5);
            expect(stubs.setup).to.be.called;
            expect(stubs.show).to.be.called;
        });

        it('should setup mobile dialog for mobile browsers', () => {
            annotator.isMobile = true;
            annotator.init();
            expect(stubs.setupMobileDialog).to.be.called;
        });
    });

    describe('setupMobileDialog()', () => {
        it('should generate mobile annotations dialog and append to container', () => {
            annotator.container = {
                appendChild: sandbox.mock()
            };
            annotator.setupMobileDialog();
            expect(annotator.container.appendChild).to.be.called;
            expect(annotator.mobileDialogEl.children.length).to.equal(1);
        });
    });

    describe('removeThreadFromSharedDialog()', () => {
        beforeEach(() => {
            sandbox.stub(util, 'hideElement');
            sandbox.stub(util, 'showElement');
        });

        it('should do nothing if the mobile dialog does not exist or is hidden', () => {
            annotator.removeThreadFromSharedDialog();
            expect(util.hideElement).to.not.be.called;

            annotator.mobileDialogEl = {
                classList: {
                    contains: sandbox.stub().returns(true)
                },
                removeChild: sandbox.stub(),
                lastChild: {}
            };
            annotator.removeThreadFromSharedDialog();
            expect(util.hideElement).to.not.be.called;
        });

        it('should generate mobile annotations dialog and append to container', () => {
            annotator.mobileDialogEl = document.createElement('div');
            annotator.mobileDialogEl.appendChild(document.createElement('div'));

            annotator.removeThreadFromSharedDialog();
            expect(util.hideElement).to.be.called;
            expect(util.showElement).to.be.called;
            expect(annotator.mobileDialogEl.children.length).to.equal(0);
        });
    });

    describe('loadAnnotations()', () => {
        beforeEach(() => {
            sandbox.stub(annotator, 'render');
            sandbox.stub(annotator, 'emit');
        });

        it('should fetch and then render annotations', () => {
            annotator.fetchPromise = Promise.resolve();
            annotator.loadAnnotations();
            return annotator.fetchPromise.then(() => {
                expect(annotator.render).to.be.called;
                expect(annotator.emit).to.not.be.called;
            }).catch((err) => {
                sinon.assert.failException;
            });
        });

        it('should emit an error if the annotator fails to fetch and render annotations', () => {
            annotator.fetchPromise = Promise.reject();
            annotator.loadAnnotations();
            return annotator.fetchPromise.then(() => {
                sinon.assert.failException;
            }).catch((err) => {
                expect(annotator.render).to.not.be.called;
                expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.loadError, err);
            });
        });
    });

    describe('setupAnnotations()', () => {
        it('should initialize thread map and bind DOM listeners', () => {
            sandbox.stub(annotator, 'bindDOMListeners');
            sandbox.stub(annotator, 'bindCustomListenersOnService');
            sandbox.stub(annotator, 'addListener');
            sandbox.stub(annotator, 'setupControllers');

            annotator.setupAnnotations();

            expect(annotator.bindDOMListeners).to.be.called;
            expect(annotator.bindCustomListenersOnService).to.be.called;
            expect(annotator.setupControllers).to.be.called;
            expect(annotator.addListener).to.be.calledWith(ANNOTATOR_EVENT.scale, sinon.match.func);
        });
    });

    describe('setupControllers()', () => {
        it('should instantiate controllers for enabled types', () => {
            annotator.modeControllers = { 'something': stubs.controller };
            annotator.options = { modeButtons: { 'something': {} } }

            stubs.controllerMock.expects('init');
            stubs.controllerMock.expects('addListener').withArgs('annotationcontrollerevent', sinon.match.func);
            annotator.setupControllers();
        });

        it('should setup shared point dialog in the point controller', () => {
            annotator.modeControllers = { 'point': stubs.controller };
            annotator.isMobile = true;

            stubs.controllerMock.expects('init');
            stubs.controllerMock.expects('setupSharedDialog').withArgs(annotator.container, {
                isMobile: annotator.isMobile,
                hasTouch: annotator.hasTouch,
                localized: annotator.localized
            });
            annotator.setupControllers();
        });
    });

    describe('once annotator is initialized', () => {
        beforeEach(() => {
            const annotatedEl = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
            annotator.annotatedElement = annotatedEl;
            sandbox.stub(annotator, 'getAnnotatedEl').returns(annotatedEl);
            sandbox.stub(annotator, 'setupAnnotations');
            sandbox.stub(annotator, 'loadAnnotations');
            annotator.init();
            annotator.setupControllers();
        });


        describe('destroy()', () => {
            it('should unbind custom listeners on thread and unbind DOM listeners', () => {
                const unbindDOMStub = sandbox.stub(annotator, 'unbindDOMListeners');
                const unbindCustomListenersOnService = sandbox.stub(annotator, 'unbindCustomListenersOnService');
                const unbindListener = sandbox.stub(annotator, 'removeListener');

                annotator.destroy();

                expect(unbindDOMStub).to.be.called;
                expect(unbindCustomListenersOnService).to.be.called;
                expect(unbindListener).to.be.calledWith(ANNOTATOR_EVENT.scale, sinon.match.func);
            });
        });

        describe('render()', () => {
            it('should call hide on each thread in map', () => {
                annotator.modeControllers = {
                    'type': {
                        render: sandbox.stub()
                    },
                    'type2': {
                        render: sandbox.stub()
                    }
                };

                annotator.render();
                expect(annotator.modeControllers['type'].render).to.be.called;
                expect(annotator.modeControllers['type2'].render).to.be.called;
            });
        });

        describe('renderPage()', () => {
            it('should call hide on each thread in map on page 1', () => {
                annotator.modeControllers = {
                    'type': {
                        renderPage: sandbox.stub()
                    },
                    'type2': {
                        renderPage: sandbox.stub()
                    }
                };
                annotator.renderPage(1);
                expect(annotator.modeControllers['type'].renderPage).to.be.calledWith(1);
                expect(annotator.modeControllers['type2'].renderPage).to.be.called;
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
                expect(permissions.canAnnotate).to.be.false;
                expect(permissions.canViewOwnAnnotations).to.be.true;
                expect(permissions.canViewAllAnnotations).to.be.false;
            });
        });

        describe('setScale()', () => {
            it('should set a data-scale attribute on the annotated element', () => {
                annotator.setScale(10);
                const annotatedEl = document.querySelector(SELECTOR_ANNOTATED_ELEMENT);
                expect(annotatedEl).to.have.attribute('data-scale', '10');
            });
        });

        describe('fetchAnnotations()', () => {
            beforeEach(() => {
                annotator.annotationService = {
                    getThreadMap: () => {}
                };
                stubs.serviceMock = sandbox.mock(annotator.annotationService);

                const threadMap = {
                    someID: [{}, {}],
                    someID2: [{}]
                };
                stubs.threadPromise = Promise.resolve(threadMap);

                annotator.permissions = {
                    canViewAllAnnotations: true,
                    canViewOwnAnnotations: true
                };
                sandbox.stub(annotator, 'emit');
            });

            it('should not fetch existing annotations if the user does not have correct permissions', () => {
                stubs.serviceMock.expects('getThreadMap').never();
                annotator.permissions = {
                    canViewAllAnnotations: false,
                    canViewOwnAnnotations: false
                };

                const result = annotator.fetchAnnotations();
                result.then(() => {
                    expect(result).to.be.true;
                }).catch(() => {
                    sinon.assert.failException;
                });
            });

            it('should fetch existing annotations if the user can view all annotations', () => {
                stubs.serviceMock.expects('getThreadMap').returns(stubs.threadPromise);
                annotator.permissions = {
                    canViewAllAnnotations: false,
                    canViewOwnAnnotations: true
                };

                const result = annotator.fetchAnnotations();
                result.then(() => {
                    expect(result).to.be.true;
                    expect(annotator.threadMap).to.not.be.undefined;
                    expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.fetch);
                }).catch(() => {
                    sinon.assert.failException;
                });
            });

            it('should fetch existing annotations if the user can view all annotations', () => {
                stubs.serviceMock.expects('getThreadMap').returns(stubs.threadPromise);
                annotator.permissions = {
                    canViewAllAnnotations: true,
                    canViewOwnAnnotations: false
                };

                const result = annotator.fetchAnnotations();
                result.then(() => {
                    expect(result).to.be.true;
                    stubs.threadPromise.then(() => {
                        expect(annotator.threadMap).to.not.be.undefined;
                        expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.fetch);
                    });
                }).catch(() => {
                    sinon.assert.failException;
                });
            });
        });

        describe('generateThreadMap()', () => {
            beforeEach(() => {
                stubs.threadMap = { '123abc': stubs.thread };
                const annotation = { location: {}, type: 'highlight' };
                const lastAnnotation = { location: {}, type: 'highlight-comment' };
                sandbox.stub(util, 'getFirstAnnotation').returns(annotation);
                sandbox.stub(util, 'getLastAnnotation').returns(lastAnnotation);
            });

            it('should do nothing if annotator conf does not exist in options', () => {
                annotator.options = {};
                sandbox.stub(annotator, 'createAnnotationThread');
                annotator.generateThreadMap(stubs.threadMap);
                expect(annotator.createAnnotationThread).to.not.be.called;
            });

            it('should reset and create a new thread map by from annotations fetched from server', () => {
                annotator.options.annotator = { NAME: 'name', TYPE: ['highlight-comment'] };
                sandbox.stub(annotator, 'createAnnotationThread').returns(stubs.thread);
                annotator.generateThreadMap(stubs.threadMap);
                expect(annotator.createAnnotationThread).to.be.called;
            });

            it('should register thread if controller exists', () => {
                annotator.options.annotator = { NAME: 'name', TYPE: ['highlight-comment'] };
                annotator.modeControllers['highlight-comment'] = stubs.controller;
                sandbox.stub(annotator, 'createAnnotationThread').returns(stubs.thread);
                stubs.controllerMock.expects('registerThread');
                annotator.generateThreadMap(stubs.threadMap);
            });

            it('should not register a highlight comment thread with a plain highlight for the first annotation', () => {
                annotator.options.annotator = { NAME: 'name', TYPE: ['highlight'] };
                annotator.modeControllers['highlight-comment'] = stubs.controller;
                stubs.controllerMock.expects('registerThread').never();
                annotator.generateThreadMap(stubs.threadMap);
            });
        });

        describe('bindCustomListenersOnService()', () => {
            it('should do nothing if the service does not exist', () => {
                annotator.annotationService = {
                    addListener: sandbox.stub()
                };

                annotator.bindCustomListenersOnService();
                expect(annotator.annotationService.addListener).to.not.be.called;
            });

            it('should add an event listener', () => {
                annotator.annotationService = new AnnotationService({
                    apiHost: 'API',
                    fileId: 1,
                    token: 'someToken',
                    canAnnotate: true,
                    canDelete: true
                });
                const addListenerStub = sandbox.stub(annotator.annotationService, 'addListener');

                annotator.bindCustomListenersOnService();
                expect(addListenerStub).to.be.calledWith(ANNOTATOR_EVENT.error, sinon.match.func);
            });
        });

        describe('handleServicesErrors()', () => {
            beforeEach(() => {
                sandbox.stub(annotator, 'emit');
            });

            it('should emit annotatorerror on read error event', () => {
                annotator.handleServicesErrors({ reason: 'read' });
                expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.error, sinon.match.string);
            });

            it('should emit annotatorerror and show annotations on create error event', () => {
                annotator.handleServicesErrors({ reason: 'create' });
                expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.error, sinon.match.string);
                expect(annotator.loadAnnotations).to.be.called;
            });

            it('should emit annotatorerror and show annotations on delete error event', () => {
                annotator.handleServicesErrors({ reason: 'delete' });
                expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.error, sinon.match.string);
                expect(annotator.loadAnnotations).to.be.called;
            });

            it('should emit annotatorerror on authorization error event', () => {
                annotator.handleServicesErrors({ reason: 'authorization' });
                expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.error, sinon.match.string);
            });

            it('should not emit annotatorerror when event does not match', () => {
                annotator.handleServicesErrors({ reason: 'no match' });
                expect(annotator.emit).to.not.be.called;
            });
        });

        describe('handleControllerEvents()', () => {
            const mode = 'something';
            let data = { mode };

            beforeEach(() => {
                sandbox.stub(annotator, 'emit');
            });

            it('should reset mobile annotation dialog on resetMobileDialog', () => {
                sandbox.stub(annotator, 'removeThreadFromSharedDialog');
                data.event = CONTROLLER_EVENT.resetMobileDialog;
                annotator.handleControllerEvents(data);
                expect(annotator.removeThreadFromSharedDialog).to.be.called;
            });

            it('should toggle annotation mode on togglemode', () => {
                sandbox.stub(annotator, 'toggleAnnotationMode');
                data.event = CONTROLLER_EVENT.toggleMode;
                annotator.handleControllerEvents(data);
                expect(annotator.toggleAnnotationMode).to.be.calledWith(mode);
            });

            it('should unbind dom listeners and emit message on mode enter', () => {
                sandbox.stub(annotator, 'unbindDOMListeners');
                data.event = CONTROLLER_EVENT.enter;
                annotator.handleControllerEvents(data);
                expect(annotator.unbindDOMListeners).to.be.called;
                expect(annotator.emit).to.be.calledWith(data.event, sinon.match.object);
            });

            it('should bind dom listeners and emit message on mode exit', () => {
                sandbox.stub(annotator, 'bindDOMListeners');
                data.event = CONTROLLER_EVENT.exit;
                annotator.handleControllerEvents(data);
                expect(annotator.bindDOMListeners).to.be.called;
                expect(annotator.emit).to.be.calledWith(data.event, sinon.match.object);
            });

            it('should create a point annotation thread on createThread', () => {
                sandbox.stub(annotator, 'createPointThread');
                data.event = CONTROLLER_EVENT.createThread;
                annotator.handleControllerEvents(data);
                expect(annotator.createPointThread).to.be.calledWith(data.data);
            });
        });

        describe('unbindCustomListenersOnService()', () => {
            it('should do nothing if the service does not exist', () => {
                annotator.annotationService = {
                    removeListener: sandbox.stub()
                };

                annotator.unbindCustomListenersOnService();
                expect(annotator.annotationService.removeListener).to.not.be.called;
            });

            it('should remove an event listener', () => {
                annotator.annotationService = new AnnotationService({
                    apiHost: 'API',
                    fileId: 1,
                    token: 'someToken',
                    canAnnotate: true,
                    canDelete: true
                });
                const removeListenerStub = sandbox.stub(annotator.annotationService, 'removeListener');

                annotator.unbindCustomListenersOnService();
                expect(removeListenerStub).to.be.called;
            });
        });

        describe('getCurrentAnnotationMode()', () => {
            it('should return null if no mode is enabled', () => {
                annotator.modeControllers['something'] = stubs.controller;
                stubs.controllerMock.expects('isEnabled').returns(false);
                expect(annotator.getCurrentAnnotationMode()).to.be.null;
            });

            it('should return the current annotation mode', () => {
                annotator.modeControllers['something'] = stubs.controller;
                stubs.controllerMock.expects('isEnabled').returns(true);
                expect(annotator.getCurrentAnnotationMode()).to.equal('something');
            });

            it('should null if no controllers exist', () => {
                annotator.modeControllers = {};
                expect(annotator.getCurrentAnnotationMode()).to.be.null;
            });
        });

        describe('createPointThread()', () => {
            beforeEach(() => {
                stubs.getLoc = sandbox.stub(annotator, 'getLocationFromEvent').returns({ page: 1 });
                sandbox.stub(annotator, 'emit');
                stubs.thread.dialog = { postAnnotation: sandbox.stub() };

                annotator.modeControllers = {
                    'point': stubs.controller
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
                expect(annotator.emit).to.not.be.called;
            });

            it('should do nothing if no location is returned fom the lastPointEvent', () => {
                stubs.getLoc.returns(null);

                const result = annotator.createPointThread({
                    lastPointEvent: {},
                    pendingThreadID: '123abc',
                    commentText: 'text'
                });
                expect(annotator.emit).to.not.be.called;
                expect(result).to.be.null;
            });

            it('should do nothing the thread does not exist in the page specified by lastPointEvent', () => {
                stubs.controllerMock.expects('getThreadByID').returns(null);
                const result = annotator.createPointThread({
                    lastPointEvent: {},
                    pendingThreadID: '123abc',
                    commentText: 'text'
                });
                expect(annotator.emit).to.not.be.called;
                expect(result).to.be.null;
            });

            it('should create a point annotation thread using lastPointEvent', () => {
                stubs.threadMock.expects('showDialog');
                stubs.threadMock.expects('getThreadEventData').returns({});
                stubs.controllerMock.expects('getThreadByID').returns(stubs.thread);

                const result = annotator.createPointThread({
                    lastPointEvent: {},
                    pendingThreadID: '123abc',
                    commentText: 'text'
                });

                expect(stubs.thread.dialog.hasComments).to.be.true;
                expect(stubs.thread.state).to.equal(STATES.hover);
                expect(stubs.thread.dialog.postAnnotation).to.be.calledWith('text');
                expect(annotator.emit).to.be.calledWith(THREAD_EVENT.threadSave, sinon.match.object);
                expect(result).to.not.be.null;
            });
        });

        describe('scrollToAnnotation()', () => {
            it('should do nothing if no threadID is provided', () => {
                stubs.threadMock.expects('scrollIntoView').never();
                annotator.scrollToAnnotation();
            });

            it('should do nothing if threadID does not exist on page', () => {
                stubs.threadMock.expects('scrollIntoView').never();
                annotator.scrollToAnnotation('wrong');
            });

            it('should scroll to annotation if threadID exists on page', () => {
                annotator.modeControllers = {
                    'type': {
                        getThreadByID: sandbox.stub().returns(stubs.thread),
                        threads: { 1: { '123abc': stubs.thread } }
                    }
                };
                stubs.threadMock.expects('scrollIntoView');
                annotator.scrollToAnnotation(stubs.thread.threadID);
            });
        });

        describe('scaleAnnotations()', () => {
            it('should set scale and rotate annotations based on the annotated element', () => {
                sandbox.stub(annotator, 'setScale');
                sandbox.stub(annotator, 'render');

                const data = {
                    scale: 5,
                    rotationAngle: 90,
                    pageNum: 2
                };
                annotator.scaleAnnotations(data);
                expect(annotator.setScale).to.be.calledWith(data.scale);
                expect(annotator.render).to.be.called;
            });
        });

        describe('toggleAnnotationMode()', () => {
            beforeEach(() => {
                annotator.modeControllers['something'] = stubs.controller;
            });

            it('should exit the current mode', () => {
                stubs.controllerMock.expects('isEnabled').returns(true);
                stubs.controllerMock.expects('exit');
                annotator.toggleAnnotationMode('something');
            });

            it('should enter the specified mode', () => {
                sandbox.stub(annotator, 'getCurrentAnnotationMode');
                stubs.controllerMock.expects('enter');
                annotator.toggleAnnotationMode('something');
            });
        });

        describe('handleValidationError()', () => {
            it('should do nothing if a annotatorerror was already emitted', () => {
                sandbox.stub(annotator, 'emit');
                annotator.validationErrorEmitted = true;
                annotator.handleValidationError();
                expect(annotator.emit).to.not.be.calledWith(ANNOTATOR_EVENT.error);
                expect(annotator.validationErrorEmitted).to.be.true;
            });

            it('should emit annotatorerror on first error', () => {
                sandbox.stub(annotator, 'emit');
                annotator.validationErrorEmitted = false;
                annotator.handleValidationError();
                expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.error, sinon.match.string);
                expect(annotator.validationErrorEmitted).to.be.true;
            });
        });

        describe('emit()', () => {
            const emitFunc = EventEmitter.prototype.emit;

            afterEach(() => {
                Object.defineProperty(EventEmitter.prototype, 'emit', { value: emitFunc });
            });

            it('should pass through the event as well as broadcast it as a annotator event', () => {
                const fileId = '1';
                const fileVersionId = '1';
                const event = 'someEvent';
                const data = {};
                const annotatorName = 'name';

                annotator = new Annotator({
                    canAnnotate: true,
                    container: document,
                    annotationService: {},
                    isMobile: false,
                    annotator: { NAME: annotatorName },
                    file: {
                        id: fileId,
                        file_version: {
                            id: fileVersionId
                        }
                    },
                    location: { locale: 'en-US' },
                    modeButtons: {},
                    localizedStrings: { anonymousUserName: 'anonymous' }
                });

                const emitStub = sandbox.stub();
                Object.defineProperty(EventEmitter.prototype, 'emit', { value: emitStub });

                annotator.emit(event, data);

                expect(emitStub).to.be.calledWith(event, data);
                expect(emitStub).to.be.calledWithMatch('annotatorevent', {
                    event,
                    data,
                    annotatorName,
                    fileId,
                    fileVersionId
                });
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
                expect(annotator.isModeAnnotatable(TYPES.point)).to.be.false;
            })

            it('should return true if the type is supported by the viewer', () => {
                expect(annotator.isModeAnnotatable(TYPES.point)).to.be.true;
            });

            it('should return false if the type is not supported by the viewer', () => {
                expect(annotator.isModeAnnotatable('drawing')).to.be.false;
            });
        });
    });
});
