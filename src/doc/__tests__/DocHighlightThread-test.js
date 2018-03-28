/* eslint-disable no-unused-expressions */
import DocHighlightDialog from '../DocHighlightDialog';
import DocHighlightThread from '../DocHighlightThread';
import AnnotationService from '../../AnnotationService';
import * as util from '../../util';
import * as docUtil from '../docUtil';
import {
    STATES,
    TYPES,
    HIGHLIGHT_FILL,
    SELECTOR_ANNOTATION_HIGHLIGHT_DIALOG,
    SELECTOR_ANNOTATION_DIALOG
} from '../../constants';

const SELECTOR_ANNOTATED_ELEMENT = '.annotated-element';

let thread;
const sandbox = sinon.sandbox.create();

describe('doc/DocHighlightThread', () => {
    before(() => {
        fixture.setBase('src');
    });

    beforeEach(() => {
        fixture.load('doc/__tests__/DocHighlightThread-test.html');

        thread = new DocHighlightThread({
            annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
            annotations: [],
            annotationService: new AnnotationService({
                apiHost: 'https://app.box.com/api',
                fileId: 1,
                token: 'someToken',
                canAnnotate: true
            }),
            fileVersionId: 1,
            location: {},
            threadID: 2,
            type: 'highlight',
            permissions: {
                canAnnotate: true,
                canViewAllAnnotations: true
            },
            minX: 1,
            maxX: 10,
            minY: 1,
            maxY: 10
        });
        thread.dialog.localized = {
            highlightToggle: 'highlight toggle'
        };
        thread.dialog.setup([]);
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
        if (typeof thread.destroy === 'function') {
            thread.destroy();
            thread = null;
        }
    });

    describe('cancelFirstComment()', () => {
        it('should switch dialogs when cancelling the first comment on an existing plain highlight', () => {
            // Adding a plain highlight annotation to the thread
            sandbox.stub(thread.annotationService, 'create').returns(Promise.resolve({}));
            sandbox.stub(thread.dialog, 'position');
            sandbox.stub(thread.dialog, 'disable');
            thread.saveAnnotation('highlight', '');

            // Cancel first comment on existing annotation
            sandbox.stub(thread.dialog, 'toggleHighlightDialogs');
            sandbox.stub(thread, 'reset');
            thread.cancelFirstComment();

            expect(thread.dialog.toggleHighlightDialogs).to.be.called;
            expect(thread.reset).to.be.called;

            // only plain highlight annotation should still exist
            expect(Object.keys(thread.annotations).length).to.equal(1);
        });

        it('should destroy the annotation when cancelling a new highlight comment annotation', () => {
            // Cancel first comment on existing annotation
            sandbox.stub(thread, 'destroy');
            thread.cancelFirstComment();

            expect(thread.destroy).to.be.called;
            expect(thread.element).to.be.undefined;
        });

        it('should reset the thread if on mobile and a comment-highlight', () => {
            sandbox.stub(thread, 'reset');
            thread.annotations = [{}, {}, {}];
            thread.isMobile = true;

            thread.cancelFirstComment();

            expect(thread.reset).to.be.called;
        });
    });

    describe('destroy()', () => {
        it('should destroy the thread', () => {
            sandbox.stub(thread, 'emit');
            thread.state = STATES.pending;

            // This stubs out a parent method by forcing the method we care about
            // in the prototype of the prototype of DocHighlightThread (ie
            // AnnotationThread's prototype) to be a stub
            Object.defineProperty(Object.getPrototypeOf(DocHighlightThread.prototype), 'destroy', {
                value: sandbox.stub()
            });

            thread.destroy();
            expect(thread.element).to.be.undefined;
            expect(thread.emit).to.be.calledWith('annotationthreadcleanup');
        });
    });

    describe('hide()', () => {
        it('should erase highlight thread from the UI', () => {
            sandbox.stub(thread, 'draw');

            thread.hide();

            expect(thread.draw).to.be.called;
        });
    });

    describe('reset()', () => {
        it('should set highlight to inactive and redraw', () => {
            sandbox.stub(thread, 'show');

            thread.reset();

            expect(thread.show).to.be.called;
            expect(thread.state).to.equal(STATES.inactive);
        });
    });

    describe('saveAnnotation()', () => {
        it('should save a plain highlight annotation', () => {
            // This stubs out a parent method by forcing the method we care about
            // in the prototype of the prototype of DocHighlightThread (ie
            // AnnotationThread's prototype) to be a stub
            Object.defineProperty(Object.getPrototypeOf(DocHighlightThread.prototype), 'saveAnnotation', {
                value: sandbox.stub()
            });

            thread.saveAnnotation(TYPES.highlight, '');
        });

        it('should save a highlight comment annotation', () => {
            // This stubs out a parent method by forcing the method we care about
            // in the prototype of the prototype of DocHighlightThread (ie
            // AnnotationThread's prototype) to be a stub
            Object.defineProperty(Object.getPrototypeOf(DocHighlightThread.prototype), 'saveAnnotation', {
                value: sandbox.stub()
            });

            thread.saveAnnotation(TYPES.highlight, 'bleh');
        });
    });

    describe('deleteAnnotation()', () => {
        it('should hide the add highlight button if the user does not have permissions', () => {
            const plainHighlightThread = new DocHighlightThread({
                annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
                annotations: [{ permissions: { can_delete: false } }],
                annotationService: new AnnotationService({
                    apiHost: 'https://app.box.com/api',
                    fileId: 1,
                    token: 'someToken',
                    canAnnotate: true
                }),
                fileVersionId: 1,
                location: {},
                threadID: 2,
                type: 'highlight',
                permissions: {
                    canAnnotate: true,
                    canViewAllAnnotations: true
                }
            });
            plainHighlightThread.dialog.localized = {
                highlightToggle: 'highlight toggle'
            };
            plainHighlightThread.dialog.setup([]);

            Object.defineProperty(Object.getPrototypeOf(DocHighlightThread.prototype), 'deleteAnnotation', {
                value: sandbox.stub()
            });
            sandbox.stub(util, 'hideElement');

            plainHighlightThread.deleteAnnotation(1);

            expect(util.hideElement).to.be.called;
        });

        it('should display the add highlight button if the user has permissions', () => {
            const plainHighlightThread = new DocHighlightThread({
                annotatedElement: document.querySelector(SELECTOR_ANNOTATED_ELEMENT),
                annotations: [{ permissions: { can_delete: true } }],
                annotationService: new AnnotationService({
                    apiHost: 'https://app.box.com/api',
                    fileId: 1,
                    token: 'someToken',
                    canAnnotate: true
                }),
                fileVersionId: 1,
                location: {},
                threadID: 2,
                type: 'highlight',
                permissions: {
                    canAnnotate: true,
                    canViewAllAnnotations: true
                }
            });

            Object.defineProperty(Object.getPrototypeOf(DocHighlightThread.prototype), 'deleteAnnotation', {
                value: sandbox.stub()
            });
            sandbox.stub(util, 'hideElement');

            plainHighlightThread.deleteAnnotation(1);

            expect(util.hideElement).to.not.be.called;
        });
    });

    describe('onMousedown()', () => {
        it('should destroy the thread when annotation is in pending state', () => {
            thread.state = STATES.pending;

            sandbox.stub(thread, 'destroy');

            thread.onMousedown();

            expect(thread.destroy).to.be.called;
        });
    });

    describe('onClick()', () => {
        it('should set annotation to inactive if event has already been consumed', () => {
            thread.state = STATES.hover;
            thread.type = TYPES.highlight_comment;

            const isHighlightPending = thread.onClick({}, true);

            expect(isHighlightPending).to.be.false;
            expect(thread.state).to.equal(STATES.inactive);
        });

        it('should set annotation to hover if mouse is hovering over highlight or dialog', () => {
            thread.state = STATES.pending;
            thread.type = TYPES.highlight_comment;
            sandbox.stub(thread, 'isOnHighlight').returns(true);
            sandbox.stub(thread, 'reset');

            const isHighlightPending = thread.onClick({}, false);

            expect(isHighlightPending).to.be.true;
            expect(thread.reset).to.not.be.called;
            expect(thread.state).to.equal(STATES.hover);
        });
    });

    describe('isOnHighlight()', () => {
        it('should return true if mouse event is over highlight', () => {
            sandbox.stub(thread, 'isInHighlight').returns(true);

            const result = thread.isOnHighlight({});

            expect(result).to.be.true;
        });

        it('should return true if mouse event is over highlight dialog', () => {
            sandbox.stub(thread, 'isInHighlight').returns(false);
            sandbox.stub(util, 'isInDialog').returns(true);

            const result = thread.isOnHighlight({});

            expect(result).to.be.true;
        });

        it('should return false if mouse event is neither over the highlight or the dialog', () => {
            sandbox.stub(thread, 'isInHighlight').returns(false);
            sandbox.stub(util, 'isInDialog').returns(false);

            const result = thread.isOnHighlight({});

            expect(result).to.be.false;
        });
    });

    describe('onMousemove()', () => {
        it('should return false if no dialog exists', () => {
            thread.dialog = undefined;
            sandbox.stub(util, 'isInDialog');

            const result = thread.onMousemove({});
            expect(result).to.be.false;
            expect(util.isInDialog).to.not.be.called;
        });

        it('should delay drawing highlight if mouse is hovering over a highlight dialog and not pending comment', () => {
            sandbox.stub(thread, 'getPageEl').returns(thread.annotatedElement);
            sandbox.stub(util, 'isInDialog').returns(true);
            thread.state = STATES.inactive;

            const result = thread.onMousemove({});

            expect(result).to.be.true;
            expect(thread.state).to.equal(STATES.hover);
        });

        it('should do nothing if mouse is hovering over a highlight dialog and pending comment', () => {
            sandbox.stub(thread, 'getPageEl').returns(thread.annotatedElement);
            sandbox.stub(util, 'isInDialog').returns(true);
            thread.state = STATES.pending_active;

            const result = thread.onMousemove({});

            expect(result).to.be.false;
        });

        it('should delay drawing highlight if mouse is hovering over a highlight', () => {
            sandbox.stub(thread, 'getPageEl').returns(thread.annotatedElement);
            sandbox.stub(util, 'isInDialog').returns(false);
            sandbox.stub(thread, 'isInHighlight').returns(true);
            thread.state = STATES.hover;

            const result = thread.onMousemove({});

            expect(result).to.be.true;
        });

        it('should not delay drawing highlight if mouse is not in highlight and the state is not already inactive', () => {
            sandbox.stub(thread, 'getPageEl').returns(thread.annotatedElement);
            sandbox.stub(util, 'isInDialog').returns(false);
            sandbox.stub(thread, 'isInHighlight').returns(false);
            thread.state = STATES.hover;

            const result = thread.onMousemove({});

            expect(thread.hoverTimeoutHandler).to.not.be.undefined;
            expect(result).to.be.false;
        });

        it('should not delay drawing highlight if the state is already inactive', () => {
            sandbox.stub(thread, 'getPageEl').returns(thread.annotatedElement);
            sandbox.stub(util, 'isInDialog').returns(false);
            sandbox.stub(thread, 'isInHighlight').returns(false);
            thread.state = STATES.inactive;

            const result = thread.onMousemove({});
            expect(thread.state).to.equal(STATES.inactive);
            expect(result).to.be.false;
        });
    });

    describe('show()', () => {
        it('should show the dialog if the state is pending', () => {
            sandbox.stub(thread, 'showDialog');

            thread.state = STATES.pending;
            thread.show();

            expect(thread.showDialog).to.be.called;
        });

        it('should not show the dialog if the state is inactive and redraw the highlight as not active', () => {
            sandbox.stub(thread, 'hideDialog');
            sandbox.stub(thread, 'draw');

            thread.state = STATES.inactive;
            thread.show();

            expect(thread.hideDialog).to.be.called;
            expect(thread.draw).to.be.calledWith(HIGHLIGHT_FILL.normal);
        });

        it('should show the dialog if the state is not pending and redraw the highlight as active', () => {
            sandbox.stub(thread, 'showDialog');
            sandbox.stub(thread, 'draw');

            thread.state = STATES.hover;
            thread.show();

            expect(thread.showDialog).to.be.called;
            expect(thread.draw).to.be.calledWith(HIGHLIGHT_FILL.active);
        });

        it('should do nothing if state is invalid', () => {
            sandbox.stub(thread, 'showDialog');
            sandbox.stub(thread, 'draw');

            thread.state = 'invalid';
            thread.show();

            expect(thread.showDialog).to.not.be.called;
            expect(thread.draw).to.not.be.called;
        });
    });

    describe('showDialog()', () => {
        it('should set up the dialog if it does not exist', () => {
            thread.dialog = {
                setup: () => {},
                show: () => {}
            };
            const dialogMock = sandbox.mock(thread.dialog);

            dialogMock.expects('setup').withArgs(thread.annotations, thread.showComment);
            dialogMock.expects('show');
            thread.showDialog();
        });
    });

    describe('createDialog()', () => {
        it('should initialize an appropriate dialog', () => {
            thread.createDialog();
            expect(thread.dialog instanceof DocHighlightDialog).to.be.true;
        });
    });

    describe('handleDraw()', () => {
        it('should clear the text selection and show the thread', () => {
            const selectionStub = {
                removeAllRanges: sandbox.stub()
            };
            sandbox.stub(window, 'getSelection').returns(selectionStub);
            sandbox.stub(thread, 'show');

            thread.handleDraw();
            expect(thread.show).to.be.called;
            expect(thread.state).to.equal(STATES.pending_active);
            expect(selectionStub.removeAllRanges).to.be.called;
        });
    });

    describe('handleCommentPending()', () => {
        it('should set the thread state to pending active', () => {
            thread.handleCommentPending();
            expect(thread.state).to.equal(STATES.pending_active);
        });
    });

    describe('handleCreate()', () => {
        it('should create a plain highlight and save', () => {
            sandbox.stub(thread, 'saveAnnotation');
            thread.handleCreate();
            expect(thread.saveAnnotation).to.be.calledWith(TYPES.highlight, '');
        });

        it('should create a highlight comment and save', () => {
            sandbox.stub(thread, 'saveAnnotation');
            sandbox.stub(thread.dialog, 'toggleHighlightCommentsReply');
            thread.annotations = { 1: {}, 2: {}, 3: {} };

            thread.handleCreate({ text: 'something' });
            expect(thread.saveAnnotation).to.be.calledWith(TYPES.highlight_comment, 'something');
        });
    });

    describe('handleDelete()', () => {
        beforeEach(() => {
            sandbox.stub(thread, 'deleteAnnotation');
            sandbox.stub(thread.dialog, 'toggleHighlightCommentsReply');
            thread.annotations = { 1: { annotationID: 1 }, 2: { annotationID: 2 }, 3: {} };
        });

        it('should delete the specified annotationID', () => {
            thread.handleDelete({ annotationID: 2 });
            expect(thread.deleteAnnotation).to.be.calledWith(2);
        });

        it('should delete the first annotation in the thread if no annotationID is provided', () => {
            thread.handleDelete();
            expect(thread.deleteAnnotation).to.be.calledWith(1);
        });
    });

    describe('bindCustomListenersOnDialog()', () => {
        it('should bind custom listeners on dialog', () => {
            thread.dialog = {
                addListener: () => {}
            };

            const addListenerStub = sandbox.stub(thread.dialog, 'addListener');

            thread.bindCustomListenersOnDialog();

            expect(addListenerStub).to.be.calledWith('annotationdraw', sinon.match.func);
            expect(addListenerStub).to.be.calledWith('annotationcommentpending', sinon.match.func);
            expect(addListenerStub).to.be.calledWith('annotationcreate', sinon.match.func);
            expect(addListenerStub).to.be.calledWith('annotationcancel', sinon.match.func);
            expect(addListenerStub).to.be.calledWith('annotationdelete', sinon.match.func);
        });
    });

    describe('unbindCustomListenersOnDialog()', () => {
        it('should unbind custom listeners on dialog', () => {
            thread.dialog = {
                removeAllListeners: () => {}
            };

            const removeAllListenersStub = sandbox.stub(thread.dialog, 'removeAllListeners');

            thread.unbindCustomListenersOnDialog();

            expect(removeAllListenersStub).to.be.calledWith('annotationdraw');
            expect(removeAllListenersStub).to.be.calledWith('annotationcommentpending');
            expect(removeAllListenersStub).to.be.calledWith('annotationcreate');
            expect(removeAllListenersStub).to.be.calledWith('annotationcancel');
            expect(removeAllListenersStub).to.be.calledWith('annotationdelete');
        });
    });

    describe('draw()', () => {
        it('should not draw if no context exists', () => {
            sandbox.stub(thread, 'getPageEl');
            sandbox.stub(docUtil, 'getContext').returns(null);
            sandbox.stub(util, 'getScale');

            thread.draw('fill');
            expect(thread.pageEl).to.be.undefined;
            expect(util.getScale).to.not.be.called;
        });
    });

    describe('isInHighlight()', () => {
        it('should not scale points if there is no dimensionScale', () => {
            const pageEl = {
                getBoundingClientRect: sandbox.stub()
            };
            pageEl.getBoundingClientRect.returns({ height: 0, top: 10 });
            const pageElStub = sandbox.stub(thread, 'getPageEl').returns(pageEl);
            const dimensionScaleStub = sandbox.stub(util, 'getDimensionScale').returns(false);
            const quadPoint = {};
            thread.location.quadPoints = [quadPoint, quadPoint, quadPoint];
            const convertStub = sandbox
                .stub(docUtil, 'convertPDFSpaceToDOMSpace')
                .returns([0, 0, 0, 0, 0, 0, 0, 0]);

            thread.isInHighlight({ clientX: 0, clientY: 0 });
            expect(pageElStub).to.be.called;
            expect(pageEl.getBoundingClientRect).to.be.called;
            expect(dimensionScaleStub).to.be.called;
            expect(convertStub).to.be.called;
        });

        it('should scale points if there is a dimensionScale', () => {
            const pageEl = {
                getBoundingClientRect: sandbox.stub()
            };
            pageEl.getBoundingClientRect.returns({ height: 0, top: 10 });
            const pageElStub = sandbox.stub(thread, 'getPageEl').returns(pageEl);
            const dimensionScaleStub = sandbox.stub(util, 'getDimensionScale').returns(true);
            const quadPoint = {};
            thread.location.quadPoints = [quadPoint, quadPoint, quadPoint];
            const convertStub = sandbox
                .stub(docUtil, 'convertPDFSpaceToDOMSpace')
                .returns([0, 0, 0, 0, 0, 0, 0, 0]);

            thread.isInHighlight({ clientX: 0, clientY: 0 });
            expect(pageElStub).to.be.called;
            expect(pageEl.getBoundingClientRect).to.be.called;
            expect(dimensionScaleStub).to.be.called;
            expect(convertStub).to.be.called;
        });

        it('get the quad points and return if the point isInPolyOpt', () => {
            const pageEl = {
                getBoundingClientRect: sandbox.stub()
            };
            pageEl.getBoundingClientRect.returns({ height: 0, top: 10 });
            const pageElStub = sandbox.stub(thread, 'getPageEl').returns(pageEl);
            const dimensionScaleStub = sandbox.stub(util, 'getDimensionScale').returns(false);
            const quadPoint = {};
            thread.location.quadPoints = [quadPoint, quadPoint, quadPoint];
            const convertStub = sandbox
                .stub(docUtil, 'convertPDFSpaceToDOMSpace')
                .returns([0, 0, 0, 0, 0, 0, 0, 0]);
            const pointInPolyStub = sandbox.stub(docUtil, 'isPointInPolyOpt');

            thread.isInHighlight({ clientX: 0, clientY: 0 });
            expect(pageElStub).to.be.called;
            expect(pageEl.getBoundingClientRect).to.be.called;
            expect(dimensionScaleStub).to.be.called;
            expect(convertStub).to.be.called;
            expect(pointInPolyStub).to.be.called;
        });
    });

    describe('regenerateBoundary()', () => {
        it('should do nothing if a valid location does not exist', () => {
            thread.location = undefined;
            thread.regenerateBoundary();

            thread.location = {};
            thread.regenerateBoundary();

            expect(thread.minX).to.be.undefined;
            expect(thread.minY).to.be.undefined;
        });

        it('should set the min/max x/y values for thread location', () => {
            thread.location = {
                quadPoints: [
                    [1, 1, 1, 1, 1, 1, 1, 1],
                    [10, 10, 10, 10, 10, 10, 10, 10]
                ]
            };
            thread.regenerateBoundary();
            expect(thread.minX).to.equal(1);
            expect(thread.minY).to.equal(1);
            expect(thread.maxX).to.equal(10);
            expect(thread.maxY).to.equal(10);
        });
    });
});
