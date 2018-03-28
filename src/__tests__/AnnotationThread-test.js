/* eslint-disable no-unused-expressions */
import EventEmitter from 'events';
import AnnotationThread from '../AnnotationThread';
import Annotation from '../Annotation';
import * as util from '../util';
import {
    STATES,
    TYPES,
    CLASS_ANNOTATION_POINT_MARKER,
    DATA_TYPE_ANNOTATION_INDICATOR,
    CLASS_HIDDEN,
    THREAD_EVENT
} from '../constants';

const SELECTOR_ANNOTATED_ELEMENT = '.annotated-element';

let thread;
const sandbox = sinon.sandbox.create();
let stubs = {};

describe('AnnotationThread', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('__tests__/AnnotationThread-test.html');

        thread = new AnnotationThread({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            annotations: [],
            annotationService: {},
            fileVersionId: '1',
            isMobile: false,
            location: {},
            threadID: '2',
            threadNumber: '1',
            type: 'point'
        });

        thread.dialog = {
            activateReply: () => {},
            addListener: () => {},
            addAnnotation: () => {},
            destroy: () => {},
            setup: () => {},
            removeAllListeners: () => {},
            show: () => {},
            hide: () => {},
            scrollToLastComment: () => {}
        };
        stubs.dialogMock = sandbox.mock(thread.dialog);

        thread.annotationService = {
            user: { id: '1' }
        };

        stubs.emit = sandbox.stub(thread, 'emit');
    });

    afterEach(() => {
        thread.annotationService = undefined;
        sandbox.verifyAndRestore();
        if (typeof stubs.destroy === 'function') {
            stubs.destroy();
            thread = null;
        }
        stubs = {};
    });

    describe('destroy()', () => {
        beforeEach(() => {
            thread.state = STATES.pending;
            stubs.unbindCustom = sandbox.stub(thread, 'unbindCustomListenersOnDialog');
            stubs.unbindDOM = sandbox.stub(thread, 'unbindDOMListeners');
            stubs.destroyDialog = sandbox.stub(thread.dialog, 'destroy');
        });

        it('should unbind listeners and remove thread element and broadcast that the thread was deleted', () => {
            thread.destroy();
            expect(stubs.unbindCustom).to.be.called;
            expect(stubs.unbindDOM).to.be.called;
            expect(stubs.emit).to.not.be.calledWith(THREAD_EVENT.threadDelete);
        });

        it('should emit annotationthreaddeleted only if thread is not in a pending state', () => {
            thread.state = STATES.inactive;

            thread.destroy();
            expect(stubs.unbindCustom).to.be.called;
            expect(stubs.unbindDOM).to.be.called;
            expect(stubs.emit).to.be.calledWith(THREAD_EVENT.threadDelete);
        });

        it('should not destroy the dialog on mobile', () => {
            thread.element = null;
            thread.isMobile = true;

            thread.destroy();
            expect(stubs.unbindCustom).to.not.be.called;
            expect(stubs.destroyDialog).to.not.be.called;
        });
    });

    describe('hide()', () => {
        it('should hide the thread element', () => {
            thread.hide();
            expect(thread.element).to.have.class(CLASS_HIDDEN);
        });
    });

    describe('reset()', () => {
        it('should set the thread state to inactive', () => {
            thread.reset();
            expect(thread.state).to.equal(STATES.inactive);
        });
    });

    describe('isDialogVisible()', () => {
        beforeEach(() => {
            thread.dialog = {
                element: document.createElement('div')
            };
        });

        it('returns true if thread\'s dialog is visible', () => {
            expect(thread.isDialogVisible()).to.be.true;
        });

        it('returns false if thread\'s dialog is hidden', () => {
            thread.dialog.element.classList.add(CLASS_HIDDEN);
            expect(thread.isDialogVisible()).to.be.false;
        });
    });

    describe('showDialog()', () => {
        it('should setup the thread dialog if the dialog element does not already exist', () => {
            thread.dialog.element = null;
            stubs.dialogMock.expects('setup');
            stubs.dialogMock.expects('show');
            thread.showDialog();
        });

        it('should not setup the thread dialog if the dialog element already exists', () => {
            thread.dialog.element = {};
            stubs.dialogMock.expects('setup').never();
            stubs.dialogMock.expects('show');
            thread.showDialog();
        });
    });

    describe('hideDialog()', () => {
        it('should hide the thread dialog', () => {
            stubs.dialogMock.expects('hide');
            thread.hideDialog();
            expect(thread.state).to.equal(STATES.inactive);
        });
    });

    describe('saveAnnotation()', () => {
        let annotationService;

        beforeEach(() => {
            annotationService = {
                create: () => {}
            };

            thread = new AnnotationThread({
                annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
                annotations: [],
                annotationService,
                fileVersionId: '1',
                location: {},
                threadID: '2',
                threadNumber: '1',
                type: 'point'
            });

            sandbox.stub(thread, 'getThreadEventData').returns({});
            stubs.create = sandbox.stub(annotationService, 'create');
            thread.dialog = {
                addAnnotation: () => {},
                activateReply: () => {},
                disable: () => {}
            };
            const dialogMock = sandbox.mock(thread.dialog);
            dialogMock.expects('disable');
        });

        it('should save an annotation with the specified type and text', (done) => {
            stubs.create.returns(Promise.resolve({}));
            stubs.updateTemp = sandbox.stub(thread, 'updateTemporaryAnnotation');

            const promise = thread.saveAnnotation('point', 'blah');
            promise
                .then(() => {
                    expect(stubs.updateTemp).to.be.called;
                    done();
                })
                .catch(() => {
                    sinon.assert.failException;
                });
            expect(stubs.create).to.be.calledWith(
                sinon.match({
                    fileVersionId: '1',
                    type: 'point',
                    text: 'blah',
                    threadID: '2',
                    threadNumber: '1'
                })
            );
        });

        it('should delete the temporary annotation and broadcast an error if there was an error saving', (done) => {
            stubs.create.returns(Promise.reject());
            stubs.handleError = sandbox.stub(thread, 'handleThreadSaveError');
            stubs.serverSave = sandbox.stub(thread, 'updateTemporaryAnnotation');

            const promise = thread.saveAnnotation('point', 'blah');
            promise
                .then(() => {
                    expect(stubs.handleError).to.be.called;
                    done();
                })
                .catch(() => {
                    sinon.assert.failException;
                });
            expect(stubs.create).to.be.called;
            expect(stubs.serverSave).to.not.be.called;
        });
    });

    describe('updateTemporaryAnnotation()', () => {
        let annotationService;

        beforeEach(() => {
            annotationService = {
                create: () => {}
            };

            thread = new AnnotationThread({
                annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
                annotations: {},
                annotationService,
                fileVersionId: '1',
                location: {},
                threadID: '2',
                threadNumber: '1',
                type: 'point'
            });

            stubs.create = sandbox.stub(annotationService, 'create');
            stubs.saveAnnotationToThread = sandbox.stub(thread, 'saveAnnotationToThread');
            sandbox.stub(thread, 'getThreadEventData').returns({});
        });

        it('should save annotation to thread if it does not exist in annotations array', () => {
            const serverAnnotation = 'real annotation';
            const tempAnnotation = serverAnnotation;
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(stubs.saveAnnotationToThread).to.be.called;
        });

        it('should overwrite a local annotation to the thread if it does exist as an associated annotation', () => {
            const serverAnnotation = { annotationID: 123 };
            const tempAnnotation = { annotationID: 1 };
            const isServerAnnotation = (annotation) => annotation === serverAnnotation;

            thread.annotations[tempAnnotation.annotationID] = tempAnnotation;
            expect(thread.annotations[123]).to.be.undefined;
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(stubs.saveAnnotationToThread).to.not.be.called;
            expect(thread.annotations[123]).to.deep.equal(serverAnnotation);
        });

        it('should emit an annotationsaved event on success', (done) => {
            const serverAnnotation = { threadNumber: 1 };
            const tempAnnotation = serverAnnotation;
            thread.threadNumber = undefined;
            thread.addListener(THREAD_EVENT.save, () => {
                expect(stubs.saveAnnotationToThread).to.be.called;
                done();
            });

            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
        });

        it('should update thread number and replace temporary annotation if dialog exists', () => {
            const serverAnnotation = { annotationID: 123 };
            const tempAnnotation = { annotationID: 1 };
            thread.threadNumber = 'something';
            thread.dialog = {
                addAnnotation: () => {},
                removeAnnotation: () => {},
                enable: () => {},
                scrollToLastComment: () => {},
                element: {
                    dataset: { threadNumber: undefined }
                }
            };
            const dialogMock = sandbox.mock(thread.dialog);

            dialogMock.expects('enable').withArgs(serverAnnotation.annotationID);
            dialogMock.expects('addAnnotation').withArgs(serverAnnotation);
            dialogMock.expects('removeAnnotation').withArgs(tempAnnotation.annotationID);
            dialogMock.expects('scrollToLastComment');
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.dialog.element.dataset.threadNumber).to.not.be.undefined;
        });

        it('should only show dialog immediately on mobile devices', () => {
            const serverAnnotation = { threadNumber: 1 };
            const tempAnnotation = serverAnnotation;
            sandbox.stub(thread, 'showDialog');

            // Don't show dialog on web browsers
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.showDialog).to.not.be.called;
            expect(thread.state).to.not.equal(STATES.hover);

            // Only show dialog on mobile browsers
            thread.isMobile = true;
            thread.updateTemporaryAnnotation(tempAnnotation, serverAnnotation);
            expect(thread.showDialog).to.be.called;
            expect(thread.state).to.equal(STATES.hover);
        });
    });

    describe('deleteAnnotation()', () => {
        let annotationService;

        beforeEach(() => {
            stubs.threadPromise = Promise.resolve();
            annotationService = {
                user: { id: 1 },
                delete: sandbox.stub().returns(stubs.threadPromise)
            };
            stubs.serviceDelete = annotationService.delete;

            stubs.annotation = {
                annotationID: 'someID',
                permissions: {
                    can_delete: true
                },
                threadID: 1
            };

            stubs.annotation2 = {
                annotationID: 'someID2',
                permissions: {
                    can_delete: false
                },
                threadID: 1
            };

            thread = new AnnotationThread({
                annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
                annotations: { someID: stubs.annotation },
                annotationService,
                fileVersionId: '1',
                isMobile: false,
                location: {},
                threadID: '2',
                threadNumber: '1',
                type: 'point'
            });

            thread.dialog = {
                addListener: () => {},
                addAnnotation: () => {},
                activateReply: () => {},
                destroy: () => {},
                removeAllListeners: () => {},
                show: () => {},
                hide: () => {},
                removeAnnotation: () => {},
                hideMobileDialog: () => {}
            };
            stubs.dialogMock = sandbox.mock(thread.dialog);

            stubs.isPlain = sandbox.stub(util, 'isPlainHighlight');
            stubs.cancel = sandbox.stub(thread, 'cancelFirstComment');
            stubs.destroy = sandbox.stub(thread, 'destroy');
            sandbox.stub(thread, 'showDialog');
            sandbox.stub(thread, 'getThreadEventData').returns({
                threadNumber: 1
            });
        });

        it('should destroy the thread if the deleted annotation was the last annotation in the thread', (done) => {
            thread.isMobile = false;
            stubs.dialogMock.expects('removeAnnotation').never();
            stubs.dialogMock.expects('hideMobileDialog').never();

            const promise = thread.deleteAnnotation('someID', false);
            promise
                .then(() => {
                    stubs.threadPromise.then(() => {
                        expect(stubs.destroy).to.be.called;
                        done();
                    });
                })
                .catch(() => {
                    sinon.assert.failException;
                });
        });

        it('should destroy the thread and hide the mobile dialog if the deleted annotation was the last annotation in the thread on mobile', (done) => {
            thread.isMobile = true;
            stubs.dialogMock.expects('removeAnnotation');
            stubs.dialogMock.expects('hideMobileDialog');

            const promise = thread.deleteAnnotation('someID', false);
            promise
                .then(() => {
                    done();
                })
                .catch(() => {
                    sinon.assert.failException;
                });
        });

        it('should remove the relevant annotation from its dialog if the deleted annotation was not the last one', (done) => {
            // Add another annotation to thread so 'someID' isn't the only annotation
            thread.annotations[stubs.annotation2.annotationID] = stubs.annotation2;
            stubs.dialogMock.expects('removeAnnotation').withArgs('someID');
            stubs.dialogMock.expects('activateReply');

            const promise = thread.deleteAnnotation('someID', false);
            promise
                .then(() => {
                    done();
                })
                .catch(() => {
                    sinon.assert.failException;
                });
        });

        it('should make a server call to delete an annotation with the specified ID if useServer is true', (done) => {
            const promise = thread.deleteAnnotation('someID', true);
            promise
                .then(() => {
                    expect(stubs.emit).to.not.be.calledWith(THREAD_EVENT.threadCleanup);
                    expect(annotationService.delete).to.be.calledWith('someID');
                    done();
                })
                .catch(() => {
                    sinon.assert.failException;
                });
        });

        it('should also delete blank highlight comment from the server when removing the last comment on a highlight thread', (done) => {
            stubs.annotation2.permissions.can_delete = false;
            thread.annotations[stubs.annotation2.annotationID] = stubs.annotation2;
            stubs.isPlain.returns(true);

            const promise = thread.deleteAnnotation('someID', true);
            promise
                .then(() => {
                    expect(annotationService.delete).to.be.calledWith('someID');
                    done();
                })
                .catch(() => {
                    sinon.assert.failException;
                });
        });

        it('should not make a server call to delete an annotation with the specified ID if useServer is false', (done) => {
            const promise = thread.deleteAnnotation('someID', false);
            promise
                .then(() => {
                    expect(annotationService.delete).to.not.be.called;
                    done();
                })
                .catch(() => {
                    sinon.assert.failException;
                });
        });

        it('should broadcast an error if there was an error deleting from server', (done) => {
            stubs.serviceDelete.returns(Promise.reject());

            const promise = thread.deleteAnnotation('someID', true);
            promise
                .then(() => {
                    sinon.assert.failException;
                })
                .catch(() => {
                    expect(annotationService.delete).to.be.called;
                    done();
                });
        });

        it('should toggle highlight dialogs with the delete of the last comment if user does not have permission to delete the entire annotation', () => {
            thread.annotations[stubs.annotation2.annotationID] = stubs.annotation2;
            stubs.isPlain.returns(true);
            thread.deleteAnnotation('someID', false);
            expect(stubs.cancel).to.be.called;
            expect(stubs.destroy).to.not.be.called;
        });

        it('should destroy the annotation with the delete of the last comment if the user has permissions', () => {
            stubs.annotation2.permissions.can_delete = true;
            thread.annotations[stubs.annotation2.annotationID] = stubs.annotation2;
            stubs.isPlain.returns(true);

            const promise = thread.deleteAnnotation('someID');
            promise
                .then(() => {
                    expect(stubs.emit).to.be.calledWith(THREAD_EVENT.threadCleanup);
                    expect(stubs.emit).to.be.calledWith(THREAD_EVENT.delete);
                    done();
                })
                .catch(() => {
                    sinon.assert.failException;
                });
            expect(stubs.cancel).to.not.be.called;
            expect(stubs.destroy).to.be.called;
        });
    });

    describe('scrollIntoView()', () => {
        it('should scroll to annotation page and center annotation in viewport', () => {
            sandbox.stub(thread, 'scrollToPage');
            sandbox.stub(thread, 'centerAnnotation');
            thread.scrollIntoView();
            expect(thread.scrollToPage);
            expect(thread.centerAnnotation).to.be.calledWith(sinon.match.number);
        });
    });

    describe('scrollToPage()', () => {
        it('should do nothing if annotation does not have a location or page', () => {
            const pageEl = {
                scrollIntoView: sandbox.stub()
            };

            thread.location = {};
            thread.scrollToPage();

            thread.location = null;
            thread.scrollToPage();
            expect(pageEl.scrollIntoView).to.not.be.called;
        });

        it('should scroll annotation\'s page into view', () => {
            thread.location = { page: 1 };
            const pageEl = {
                scrollIntoView: sandbox.stub()
            };
            thread.annotatedElement = {
                querySelector: sandbox.stub().returns(pageEl)
            };
            thread.scrollToPage();
            expect(pageEl.scrollIntoView).to.be.called;
        });
    });

    describe('centerAnnotation', () => {
        beforeEach(() => {
            thread.annotatedElement = {
                scrollHeight: 100,
                scrollTop: 0,
                scrollBottom: 200
            };
        });

        it('should scroll so annotation is vertically centered in viewport', () => {
            thread.centerAnnotation(50);
            expect(thread.annotatedElement.scrollTop).to.equal(50);
        });

        it('should scroll so annotation is vertically centered in viewport', () => {
            thread.centerAnnotation(150);
            expect(thread.annotatedElement.scrollTop).to.equal(200);
        });
    });

    describe('location()', () => {
        it('should get location', () => {
            expect(thread.location).to.equal(thread.location);
        });
    });

    describe('threadID()', () => {
        it('should get threadID', () => {
            expect(thread.threadID).to.equal(thread.threadID);
        });
    });

    describe('thread()', () => {
        it('should get thread', () => {
            expect(thread.thread).to.equal(thread.thread);
        });
    });

    describe('type()', () => {
        it('should get type', () => {
            expect(thread.type).to.equal(thread.type);
        });
    });

    describe('state()', () => {
        it('should get state', () => {
            expect(thread.state).to.equal(thread.state);
        });
    });

    describe('setup()', () => {
        beforeEach(() => {
            stubs.create = sandbox.stub(thread, 'createDialog');
            stubs.bind = sandbox.stub(thread, 'bindCustomListenersOnDialog');
            stubs.setup = sandbox.stub(thread, 'setupElement');
        });

        it('should setup dialog', () => {
            thread.dialog = {};
            thread.setup();
            expect(stubs.create).to.be.called;
            expect(stubs.bind).to.be.called;
            expect(stubs.setup).to.be.called;
            expect(thread.dialog.isMobile).to.equal(thread.isMobile);
        });

        it('should set state to pending if thread is initialized with no annotations', () => {
            thread.setup();
            expect(thread.state).to.equal(STATES.pending);
        });

        it('should set state to inactive if thread is initialized with annotations', () => {
            thread = new AnnotationThread({
                annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
                annotations: [{}],
                annotationService: {},
                fileVersionId: '1',
                isMobile: false,
                location: {},
                threadID: '2',
                threadNumber: '1',
                type: 'point'
            });

            thread.setup();
            expect(thread.state).to.equal(STATES.inactive);
        });
    });

    describe('setupElement()', () => {
        it('should create element and bind listeners', () => {
            stubs.bind = sandbox.stub(thread, 'bindDOMListeners');

            thread.setupElement();
            expect(thread.element instanceof HTMLElement).to.be.true;
            expect(thread.element).to.have.class(CLASS_ANNOTATION_POINT_MARKER);
            expect(stubs.bind).to.be.called;
        });
    });

    describe('bindDOMListeners()', () => {
        beforeEach(() => {
            thread.element = document.createElement('div');
            stubs.add = sandbox.stub(thread.element, 'addEventListener');
            thread.isMobile = false;
        });

        it('should do nothing if element does not exist', () => {
            thread.element = null;
            thread.bindDOMListeners();
            expect(stubs.add).to.not.be.called;
        });

        it('should bind DOM listeners', () => {
            thread.bindDOMListeners();
            expect(stubs.add).to.be.calledWith('click', sinon.match.func);
            expect(stubs.add).to.be.calledWith('mouseenter', sinon.match.func);
            expect(stubs.add).to.be.calledWith('mouseleave', sinon.match.func);
        });

        it('should not add mouseleave listener for mobile browsers', () => {
            thread.isMobile = true;
            thread.bindDOMListeners();
            expect(stubs.add).to.be.calledWith('click', sinon.match.func);
            expect(stubs.add).to.be.calledWith('mouseenter', sinon.match.func);
            expect(stubs.add).to.not.be.calledWith('mouseleave', sinon.match.func);
        });
    });

    describe('unbindDOMListeners()', () => {
        beforeEach(() => {
            thread.element = document.createElement('div');
            stubs.remove = sandbox.stub(thread.element, 'removeEventListener');
            thread.isMobile = false;
        });

        it('should do nothing if element does not exist', () => {
            thread.element = null;
            thread.unbindDOMListeners();
            expect(stubs.remove).to.not.be.called;
        });

        it('should unbind DOM listeners', () => {
            thread.unbindDOMListeners();
            expect(stubs.remove).to.be.calledWith('click', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('mouseenter', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('mouseleave', sinon.match.func);
        });

        it('should not add mouseleave listener for mobile browsers', () => {
            thread.isMobile = true;
            thread.unbindDOMListeners();
            expect(stubs.remove).to.be.calledWith('click', sinon.match.func);
            expect(stubs.remove).to.be.calledWith('mouseenter', sinon.match.func);
            expect(stubs.remove).to.not.be.calledWith('mouseleave', sinon.match.func);
        });
    });

    describe('bindCustomListenersOnDialog()', () => {
        it('should do nothing if dialog does not exist', () => {
            thread.dialog = null;
            stubs.dialogMock.expects('addListener').never();
            thread.bindCustomListenersOnDialog();
        });

        it('should bind custom listeners on dialog', () => {
            stubs.dialogMock.expects('addListener').withArgs('annotationcreate', sinon.match.func);
            stubs.dialogMock.expects('addListener').withArgs('annotationcancel', sinon.match.func);
            stubs.dialogMock.expects('addListener').withArgs('annotationdelete', sinon.match.func);
            thread.bindCustomListenersOnDialog();
        });
    });

    describe('unbindCustomListenersOnDialog()', () => {
        it('should do nothing if dialog does not exist', () => {
            thread.dialog = null;
            stubs.dialogMock.expects('removeAllListeners').never();
            thread.unbindCustomListenersOnDialog();
        });

        it('should unbind custom listeners from dialog', () => {
            stubs.dialogMock.expects('removeAllListeners').withArgs('annotationcreate');
            stubs.dialogMock.expects('removeAllListeners').withArgs('annotationcancel');
            stubs.dialogMock.expects('removeAllListeners').withArgs('annotationdelete');
            thread.unbindCustomListenersOnDialog();
        });
    });

    describe('cancelUnsavedAnnotation()', () => {
        it('should destroy thread if in a pending/pending-active state', () => {
            sandbox.stub(thread, 'destroy');
            sandbox.stub(thread, 'hideDialog');
            stubs.isPending = sandbox.stub(util, 'isPending').returns(true);

            thread.cancelUnsavedAnnotation();
            expect(thread.destroy).to.be.called;
            expect(thread.emit).to.be.calledWith(THREAD_EVENT.cancel);
            expect(thread.hideDialog).to.not.be.called;
        });

        it('should not destroy thread if not in a pending/pending-active state', () => {
            sandbox.stub(thread, 'destroy');
            sandbox.stub(thread, 'hideDialog');
            stubs.isPending = sandbox.stub(util, 'isPending').returns(false);

            thread.cancelUnsavedAnnotation();
            expect(thread.destroy).to.not.be.called;
            expect(thread.emit).to.not.be.calledWith(THREAD_EVENT.cancel);
            expect(thread.hideDialog).to.be.called;
        });
    });

    describe('getThreadEventData()', () => {
        it('should return thread type and threadID', () => {
            thread.annotationService.user = { id: -1 };
            thread.threadNumber = undefined;
            const data = thread.getThreadEventData();
            expect(data).to.deep.equal({
                type: thread.type,
                threadID: thread.threadID
            });
        });

        it('should also return annotator\'s user id', () => {
            thread.annotationService.user = { id: 1 };
            thread.threadNumber = undefined;
            const data = thread.getThreadEventData();
            expect(data).to.deep.equal({
                type: thread.type,
                threadID: thread.threadID,
                userId: 1
            });
        });

        it('should return thread type and threadID', () => {
            thread.annotationService.user = { id: -1 };
            thread.threadNumber = 1;
            const data = thread.getThreadEventData();
            expect(data).to.deep.equal({
                type: thread.type,
                threadID: thread.threadID,
                threadNumber: 1
            });
        });
    });

    describe('createElement()', () => {
        it('should create an element with the right class and attribute', () => {
            const element = thread.createElement();
            expect(element).to.have.class(CLASS_ANNOTATION_POINT_MARKER);
            expect(element).to.have.attribute('data-type', DATA_TYPE_ANNOTATION_INDICATOR);
        });
    });

    describe('mouseoutHandler()', () => {
        it('should do nothing if event does not exist', () => {
            stubs.isInDialog = sandbox.stub(util, 'isInDialog');
            thread.mouseoutHandler();
            expect(stubs.isInDialog).to.not.be.called;
        });

        it('should not call hideDialog if there are no annotations in the thread', () => {
            stubs.hide = sandbox.stub(thread, 'hideDialog');
            thread.mouseoutHandler({});
            expect(stubs.hide).to.not.be.called;
        });

        it('should call hideDialog if there are annotations in the thread', () => {
            stubs.hide = sandbox.stub(thread, 'hideDialog');
            const annotation = new Annotation({
                fileVersionId: '2',
                threadID: '1',
                type: 'point',
                text: 'blah',
                threadNumber: '1',
                location: { x: 0, y: 0 },
                created: Date.now()
            });

            thread.annotations = [annotation];
            thread.mouseoutHandler({});
            expect(stubs.hide).to.be.called;
        });
    });

    describe('saveAnnotationToThread()', () => {
        it('should add the annotation to the thread, and add to the dialog when the dialog exists', () => {
            stubs.push = sandbox.stub(thread.annotations, 'push');
            const annotation = new Annotation({
                fileVersionId: '2',
                threadID: '1',
                type: 'point',
                text: 'blah',
                threadNumber: '1',
                location: { x: 0, y: 0 },
                created: Date.now()
            });

            stubs.dialogMock.expects('activateReply');
            stubs.dialogMock.expects('addAnnotation').withArgs(annotation);
            thread.saveAnnotationToThread(annotation);
            expect(thread.annotations[annotation.annotationID]).to.not.be.undefined;
        });

        it('should not try to push an annotation to the dialog if it doesn\'t exist', () => {
            const annotation = new Annotation({
                fileVersionId: '2',
                threadID: '1',
                type: 'point',
                text: 'blah',
                threadNumber: '1',
                location: { x: 0, y: 0 },
                created: Date.now()
            });

            thread.dialog = undefined;
            stubs.dialogMock.expects('activateReply').never();
            stubs.dialogMock.expects('addAnnotation').never();
            thread.saveAnnotationToThread(annotation);
            expect(thread.annotations[annotation.annotationID]).to.not.be.undefined;
        });
    });

    describe('createAnnotationDialog()', () => {
        it('should correctly create the annotation data object', () => {
            const annotationData = thread.createAnnotationData('highlight', 'test');
            expect(annotationData.location).to.equal(thread.location);
            expect(annotationData.fileVersionId).to.equal(thread.fileVersionId);
            expect(annotationData.thread).to.equal(thread.thread);
            expect(annotationData.user.id).to.equal('1');
        });
    });

    describe('createAnnotation()', () => {
        it('should create a new point annotation', () => {
            sandbox.stub(thread, 'saveAnnotation');
            thread.createAnnotation({ text: 'bleh' });
            expect(thread.saveAnnotation).to.be.calledWith(TYPES.point, 'bleh');
        });
    });

    describe('deleteAnnotationWithID()', () => {
        it('should delete a point annotation with the matching annotationID', () => {
            sandbox.stub(thread, 'deleteAnnotation');
            thread.deleteAnnotationWithID({ annotationID: 1 });
            expect(thread.deleteAnnotation).to.be.calledWith(1);
        });
    });

    describe('regenerateBoundary()', () => {
        it('should do nothing if a valid location does not exist', () => {
            thread.location = undefined;
            thread.regenerateBoundary();

            thread.location = {};
            thread.regenerateBoundary();

            thread.location = { x: 'something' };
            thread.regenerateBoundary();

            thread.location = { y: 'something' };
            thread.regenerateBoundary();

            expect(thread.minX).to.be.undefined;
            expect(thread.minY).to.be.undefined;
        });

        it('should set the min/max x/y values to the thread location', () => {
            thread.location = { x: 1, y: 2 };
            thread.regenerateBoundary();
            expect(thread.minX).to.equal(1);
            expect(thread.minY).to.equal(2);
            expect(thread.maxX).to.equal(1);
            expect(thread.maxY).to.equal(2);
        });
    });

    describe('handleThreadSaveError()', () => {
        it('should delete temp annotation and emit event', () => {
            sandbox.stub(thread, 'deleteAnnotation');
            thread.handleThreadSaveError(new Error(), 1);
            expect(thread.deleteAnnotation).to.be.calledWith(1, false);
            expect(thread.emit).to.be.calledWith(THREAD_EVENT.createError);
        });
    });
});
