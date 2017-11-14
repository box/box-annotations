/* eslint-disable no-unused-expressions */
import EventEmitter from 'events';
import Annotator from '../Annotator';
import * as annotatorUtil from '../annotatorUtil';
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
} from '../annotationConstants';

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
            exit: () => {}
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
        annotator.threads = {};

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
            const annotatedEl = document.querySelector('.annotated-element');
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
        });

        it('should setup shared point dialog in the point controller', () => {
            annotator.container = {
                appendChild: sandbox.mock()
            };
            annotator.modeControllers = {
                'point': { setupSharedDialog: sandbox.stub() }
            };
            const pointController = annotator.modeControllers['point'];

            annotator.setupMobileDialog();
            expect(pointController.setupSharedDialog).to.be.calledWith(annotator.container, {
                isMobile: annotator.isMobile,
                hasTouch: annotator.hasTouch,
                localized: annotator.localized
            });
        });
    });

    describe('loadAnnotations()', () => {
        beforeEach(() => {
            sandbox.stub(annotator, 'renderAnnotations');
            sandbox.stub(annotator, 'emit');
        });

        it('should fetch and then render annotations', () => {
            annotator.fetchPromise = Promise.resolve();
            annotator.loadAnnotations();
            return annotator.fetchPromise.then(() => {
                expect(annotator.renderAnnotations).to.be.called;
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
                expect(annotator.renderAnnotations).to.not.be.called;
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

            expect(annotator.threads).to.not.be.undefined;
            expect(annotator.bindDOMListeners).to.be.called;
            expect(annotator.bindCustomListenersOnService).to.be.called;
            expect(annotator.setupControllers).to.be.called;
            expect(annotator.addListener).to.be.calledWith(ANNOTATOR_EVENT.scale, sinon.match.func);
        });
    });

    describe('setupControllers()', () => {
        it('should instantiate controllers for enabled types', () => {
            annotator.options = {
                annotator: {
                    NAME: 'name',
                    CONTROLLERS: { 'something': stubs.controller }
                },
                modeButtons: { 'something': {} }
            };

            stubs.controllerMock.expects('init');
            stubs.controllerMock.expects('addListener').withArgs('annotationcontrollerevent', sinon.match.func);
            annotator.setupControllers();
        });
    });

    describe('once annotator is initialized', () => {
        beforeEach(() => {
            const annotatedEl = document.querySelector('.annotated-element');
            annotator.annotatedElement = annotatedEl;
            sandbox.stub(annotator, 'getAnnotatedEl').returns(annotatedEl);
            sandbox.stub(annotator, 'setupAnnotations');
            sandbox.stub(annotator, 'loadAnnotations');
            annotator.init();
            annotator.setupControllers();

            annotator.threads = {
                1: { '123abc': stubs.thread },
                2: {
                    '456def': stubs.thread2,
                    '789ghi': stubs.thread3
                }
            }
        });

        afterEach(() => {
            annotator.threads = {};
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

        describe('hideAnnotations()', () => {
            it('should call hide on each thread in map', () => {
                sandbox.stub(annotator, 'hideAnnotationsOnPage');
                annotator.hideAnnotations();
                expect(annotator.hideAnnotationsOnPage).to.be.calledTwice;
            });
        });

        describe('hideAnnotationsOnPage()', () => {
            it('should call hide on each thread in map on page 1', () => {
                stubs.threadMock.expects('hide');
                stubs.threadMock2.expects('hide').never();
                stubs.threadMock3.expects('hide').never();
                annotator.hideAnnotationsOnPage(1);
            });
        });

        describe('renderAnnotations()', () => {
            it('should call show on each thread', () => {
                sandbox.stub(annotator, 'renderAnnotationsOnPage');
                annotator.renderAnnotations();
                expect(annotator.renderAnnotationsOnPage).to.be.calledTwice;
            });
        });

        describe('renderAnnotationsOnPage()', () => {
            it('should call show on each thread', () => {
                sandbox.stub(annotator, 'isModeAnnotatable').returns(true);
                stubs.threadMock.expects('show');
                stubs.threadMock2.expects('show').never();
                stubs.threadMock3.expects('show').never();
                annotator.renderAnnotationsOnPage(1);
            });

            it('should not call show() if the thread type is disabled', () => {
                const badType = 'not_accepted';
                stubs.thread3.type = badType;
                stubs.thread2.type = 'something';

                stubs.threadMock3.expects('show').never();
                stubs.threadMock2.expects('show').once();

                const isModeAnn = sandbox.stub(annotator, 'isModeAnnotatable');
                isModeAnn.withArgs(badType).returns(false);
                isModeAnn.withArgs('something').returns(true);

                annotator.renderAnnotationsOnPage('2');
            });

            it('should set annotatedElement if thread was fetched before it was set', () => {
                stubs.thread2.annotatedElement = undefined;
                stubs.threadMock2.expects('show').once();
                sandbox.stub(annotator, 'isModeAnnotatable').returns(true);
                annotator.renderAnnotationsOnPage('2');
            });
        });

        describe('rotateAnnotations()', () => {
            beforeEach(() => {
                annotator.permissions.canAnnotate = true;
                stubs.hide = sandbox.stub(annotatorUtil, 'hideElement');
                stubs.show = sandbox.stub(annotatorUtil, 'showElement');
                stubs.render = sandbox.stub(annotator, 'renderAnnotations');
                stubs.renderPage = sandbox.stub(annotator, 'renderAnnotationsOnPage');

                annotator.modeButtons = {
                    point: { selector: 'point_btn' },
                    draw: { selector: 'draw_btn' }
                };
                annotator.modeControllers['point'] = stubs.controller;
            });

            afterEach(() => {
                annotator.modeButtons = {};
            });

            it('should only render annotations if user cannot annotate', () => {
                annotator.permissions.canAnnotate = false;
                annotator.rotateAnnotations();
                expect(stubs.hide).to.not.be.called;
                expect(stubs.show).to.not.be.called;
                expect(stubs.render).to.be.called;
            });

            it('should hide point annotation button if image is rotated', () => {
                annotator.rotateAnnotations(90);
                expect(stubs.hide).to.be.called;
                expect(stubs.show).to.not.be.called;
                expect(stubs.render).to.be.called;
            });

            it('should show point annotation button if image is rotated', () => {
                annotator.rotateAnnotations();
                expect(stubs.hide).to.not.be.called;
                expect(stubs.show).to.be.called;
                expect(stubs.render).to.be.called;
            });
        });

        describe('getAnnotationPermissions()', () => {
            it('should return the appropriate annotation permissions for the file', () => {
                const file = {
                    permissions: {
                        can_annotate: false,
                        can_view_annotations_self: true
                    }
                };
                annotator.getAnnotationPermissions(file);
                expect(annotator.permissions.canAnnotate).to.be.truthy;
                expect(annotator.permissions.canViewOwnAnnotations).to.be.falsy;
                expect(annotator.permissions.canViewAllAnnotations).to.be.falsy;
            });
        });

        describe('setScale()', () => {
            it('should set a data-scale attribute on the annotated element', () => {
                annotator.setScale(10);
                const annotatedEl = document.querySelector('.annotated-element');
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

            it('should not fetch existing annotations if the user does not have correct permissions', (done) => {
                stubs.serviceMock.expects('getThreadMap').never();
                annotator.permissions = {
                    canViewAllAnnotations: false,
                    canViewOwnAnnotations: false
                };

                const result = annotator.fetchAnnotations();
                result.should.be.fulfilled.then(() => {
                    expect(result).to.be.truthy;
                    done();
                }).catch(() => {
                    sinon.assert.failException;
                });
            });

            it('should fetch existing annotations if the user can view all annotations', (done) => {
                stubs.serviceMock.expects('getThreadMap').returns(stubs.threadPromise);
                annotator.permissions = {
                    canViewAllAnnotations: false,
                    canViewOwnAnnotations: true
                };

                const result = annotator.fetchAnnotations();
                result.should.be.fulfilled.then(() => {
                    expect(result).to.be.truthy;
                    expect(annotator.threadMap).to.not.be.undefined;
                    expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.fetch);
                    done();
                }).catch(() => {
                    sinon.assert.failException;
                });
            });

            it('should fetch existing annotations if the user can view all annotations', (done) => {
                stubs.serviceMock.expects('getThreadMap').returns(stubs.threadPromise);
                annotator.permissions = {
                    canViewAllAnnotations: true,
                    canViewOwnAnnotations: false
                };

                const result = annotator.fetchAnnotations();
                result.should.be.fulfilled.then(() => {
                    expect(result).to.be.truthy;
                    stubs.threadPromise.should.be.fulfilled.then(() => {
                        expect(annotator.threadMap).to.not.be.undefined;
                        expect(annotator.emit).to.be.calledWith(ANNOTATOR_EVENT.fetch);
                        done();
                    });
                }).catch(() => {
                    sinon.assert.failException;
                });
            });
        });

        describe('generateThreadMap()', () => {
            beforeEach(() => {
                stubs.threadMap = { '123abc': stubs.thread };
                const annotation = { location: {}, type: 'something' };
                sandbox.stub(annotatorUtil, 'getFirstAnnotation').returns(annotation);
                sandbox.stub(annotator, 'isModeAnnotatable').returns(true);
            });

            it('should do nothing if annotator conf does not exist in options', () => {
                annotator.options = {};
                sandbox.stub(annotator, 'createAnnotationThread');
                annotator.generateThreadMap(stubs.threadMap);
                expect(annotator.createAnnotationThread).to.not.be.called;
            });

            it('should reset and create a new thread map by from annotations fetched from server', () => {
                annotator.options.annotator = { NAME: 'name' };
                sandbox.stub(annotator, 'createAnnotationThread').returns(stubs.thread);
                annotator.generateThreadMap(stubs.threadMap);
                expect(annotator.createAnnotationThread).to.be.called;
            });

            it('should register thread if controller exists', () => {
                annotator.options.annotator = { NAME: 'name' };
                annotator.modeControllers['something'] = stubs.controller;
                sandbox.stub(annotator, 'createAnnotationThread').returns(stubs.thread);
                stubs.controllerMock.expects('registerThread');
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
            let data = {};

            beforeEach(() => {
                sandbox.stub(annotator, 'emit');
                data = { mode, data: { headerSelector: 'selector' } };
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

            it('should bind dom listeners and emit message on mode exit', () => {
                sandbox.stub(annotatorUtil, 'addThreadToMap').returns(annotator.threads[1]);
                data.event = CONTROLLER_EVENT.register;
                annotator.handleControllerEvents(data);
                expect(annotatorUtil.addThreadToMap).to.be.called;
                expect(annotator.emit).to.be.calledWith(data.event, data.data);
            });

            it('should bind dom listeners and emit message on mode exit', () => {
                sandbox.stub(annotatorUtil, 'removeThreadFromMap').returns(annotator.threads[1]);
                data.event = CONTROLLER_EVENT.unregister;
                annotator.handleControllerEvents(data);
                expect(annotatorUtil.removeThreadFromMap).to.be.called;
                expect(annotator.emit).to.be.calledWith(data.event, data.data);
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
                expect(annotator.getCurrentAnnotationMode()).equals('something');
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
            });

            it('should do nothing if the point data is invalid', () => {
                annotator.createPointThread({ lastPointEvent: {}, pendingThreadID: '123abc', commentText: ' ' });
                annotator.createPointThread({ lastPointEvent: {}, pendingThreadID: '123abc' });
                annotator.createPointThread({ lastPointEvent: {}, commentText: ' ' });
                annotator.createPointThread({ pendingThreadID: '123abc', commentText: ' ' });
                expect(annotator.emit).to.not.be.called;
            });

            it('should do nothing if no location is returned fom the lastPointEvent', () => {
                stubs.getLoc.returns(null);
                const result = annotator.createPointThread({ lastPointEvent: {}, pendingThreadID: '123abc', commentText: 'text' });
                expect(annotator.emit).to.not.be.called;
                expect(result).to.be.null;
            });

            it('should do nothing the thread does not exist in the page specified by lastPointEvent', () => {
                annotator.threads = {};
                const result = annotator.createPointThread({ lastPointEvent: {}, pendingThreadID: '123abc', commentText: 'text' });
                expect(annotator.emit).to.not.be.called;
                expect(result).to.be.null;
            });

            it('should create a point annotation thread using lastPointEvent', () => {
                stubs.threadMock.expects('showDialog');
                stubs.threadMock.expects('getThreadEventData').returns({});
                const result = annotator.createPointThread({ lastPointEvent: {}, pendingThreadID: '123abc', commentText: 'text' });
                expect(stubs.thread.dialog.hasComments).to.be.truthy;
                expect(stubs.thread.state).equals(STATES.hover);
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
                annotator.threads = { 1: { '123abc': stubs.thread } };
                stubs.threadMock.expects('scrollIntoView');
                annotator.scrollToAnnotation(stubs.thread.threadID);
            });
        });

        describe('scaleAnnotations()', () => {
            it('should set scale and rotate annotations based on the annotated element', () => {
                sandbox.stub(annotator, 'setScale');
                sandbox.stub(annotator, 'rotateAnnotations');

                const data = {
                    scale: 5,
                    rotationAngle: 90,
                    pageNum: 2
                };
                annotator.scaleAnnotations(data);
                expect(annotator.setScale).to.be.calledWith(data.scale);
                expect(annotator.rotateAnnotations).to.be.calledWith(data.rotationAngle, data.pageNum);
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
                expect(annotator.isModeAnnotatable(TYPES.point)).to.equal(false);
            })

            it('should return true if the type is supported by the viewer', () => {
                expect(annotator.isModeAnnotatable(TYPES.point)).to.equal(true);
            });

            it('should return false if the type is not supported by the viewer', () => {
                expect(annotator.isModeAnnotatable('drawing')).to.equal(false);
            });
        });
    });
});
