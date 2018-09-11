/* eslint-disable no-unused-expressions */
import DocHighlightDialog from '../DocHighlightDialog';
import DocHighlightThread from '../DocHighlightThread';
import AnnotationService from '../../AnnotationService';
import * as util from '../../util';
import * as docUtil from '../docUtil';
import { STATES, TYPES, HIGHLIGHT_FILL, SELECTOR_ANNOTATED_ELEMENT } from '../../constants';

let thread;

const html = `<div class="annotated-element">
  <div class="ba-annotation-dialog ba-annotation-highlight-dialog">
    <button class="ba-highlight-comment-btn"></button>
    <textarea class="annotation-textarea"></textarea>
  </div>
</div>`;

jest.mock('../DocHighlightDialog');

describe('doc/DocHighlightThread', () => {
    let rootElement;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

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
        thread.dialog.setup();

        window.getSelection = jest.fn().mockReturnValue({
            removeAllRanges: jest.fn()
        });
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        if (typeof thread.destroy === 'function') {
            thread.destroy();
            thread = null;
        }
    });

    describe('cancelFirstComment()', () => {
        it('should switch dialogs when cancelling the first comment on an existing plain highlight', () => {
            // Adding a plain highlight annotation to the thread
            thread.annotationService.create = jest.fn().mockResolvedValue({});
            thread.saveAnnotation('highlight', '');

            // Cancel first comment on existing annotation
            thread.reset = jest.fn();
            thread.cancelFirstComment();

            expect(thread.dialog.toggleHighlightDialogs).toBeCalled();
            expect(thread.reset).toBeCalled();

            // only plain highlight annotation should still exist
            expect(Object.keys(thread.annotations).length).toEqual(1);
        });

        it('should destroy the annotation when cancelling a new highlight comment annotation', () => {
            // Cancel first comment on existing annotation
            thread.destroy = jest.fn();
            thread.cancelFirstComment();

            expect(thread.destroy).toBeCalled();
            expect(thread.element).toBeUndefined();
        });

        it('should reset the thread if on mobile and a comment-highlight', () => {
            thread.reset = jest.fn();
            thread.annotations = [{}, {}, {}];
            thread.isMobile = true;

            thread.cancelFirstComment();

            expect(thread.reset).toBeCalled();
        });
    });

    describe('destroy()', () => {
        it('should destroy the thread', () => {
            thread.emit = jest.fn();
            thread.state = STATES.pending;

            // This stubs out a parent method by forcing the method we care about
            // in the prototype of the prototype of DocHighlightThread (ie
            // AnnotationThread's prototype) to be a stub
            Object.defineProperty(Object.getPrototypeOf(DocHighlightThread.prototype), 'destroy', {
                value: jest.fn()
            });

            thread.destroy();
            expect(thread.element).toBeUndefined();
            expect(thread.emit).toBeCalledWith('annotationthreadcleanup');
        });
    });

    describe('hide()', () => {
        it('should erase highlight thread from the UI', () => {
            thread.draw = jest.fn();
            thread.hide();
            expect(thread.draw).toBeCalled();
        });
    });

    describe('reset()', () => {
        it('should set highlight to inactive and redraw', () => {
            thread.show = jest.fn();
            thread.reset();
            expect(thread.show).toBeCalled();
            expect(thread.state).toEqual(STATES.inactive);
        });
    });

    describe('saveAnnotation()', () => {
        it('should save a plain highlight annotation', () => {
            // This stubs out a parent method by forcing the method we care about
            // in the prototype of the prototype of DocHighlightThread (ie
            // AnnotationThread's prototype) to be a stub
            Object.defineProperty(Object.getPrototypeOf(DocHighlightThread.prototype), 'saveAnnotation', {
                value: jest.fn()
            });

            thread.saveAnnotation(TYPES.highlight, '');
        });

        it('should save a highlight comment annotation', () => {
            // This stubs out a parent method by forcing the method we care about
            // in the prototype of the prototype of DocHighlightThread (ie
            // AnnotationThread's prototype) to be a stub
            Object.defineProperty(Object.getPrototypeOf(DocHighlightThread.prototype), 'saveAnnotation', {
                value: jest.fn()
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
            plainHighlightThread.setup();
            plainHighlightThread.dialog = {
                element: document.createElement('div')
            };

            Object.defineProperty(Object.getPrototypeOf(DocHighlightThread.prototype), 'deleteAnnotation', {
                value: jest.fn()
            });
            util.hideElement = jest.fn();

            plainHighlightThread.deleteAnnotation(1);
            expect(util.hideElement).toBeCalled();
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
                value: jest.fn()
            });
            util.hideElement = jest.fn();

            plainHighlightThread.deleteAnnotation(1);
            expect(util.hideElement).not.toBeCalled();
        });
    });

    describe('onMousedown()', () => {
        it('should destroy the thread when annotation is in pending state', () => {
            thread.state = STATES.pending;
            thread.destroy = jest.fn();
            thread.onMousedown();
            expect(thread.destroy).toBeCalled();
        });
    });

    describe('onClick()', () => {
        it('should set annotation to inactive if event has already been consumed', () => {
            thread.state = STATES.hover;
            thread.type = TYPES.highlight_comment;

            const isHighlightPending = thread.onClick({}, true);

            expect(isHighlightPending).toBeFalsy();
            expect(thread.state).toEqual(STATES.inactive);
        });

        it('should set annotation to hover if mouse is hovering over highlight or dialog', () => {
            thread.state = STATES.pending;
            thread.type = TYPES.highlight_comment;

            thread.isOnHighlight = jest.fn().mockReturnValue(true);
            thread.reset = jest.fn();
            thread.show = jest.fn();

            const isHighlightPending = thread.onClick({}, false);

            expect(isHighlightPending).toBeTruthy();
            expect(thread.reset).not.toBeCalled();
            expect(thread.state).toEqual(STATES.hover);
            expect(thread.show).toBeCalled();
        });
    });

    describe('isOnHighlight()', () => {
        it('should return true if mouse event is over highlight', () => {
            thread.isInHighlight = jest.fn().mockReturnValue(true);
            const result = thread.isOnHighlight({});
            expect(result).toBeTruthy();
        });

        it('should return true if mouse event is over highlight dialog', () => {
            thread.isInHighlight = jest.fn().mockReturnValue(false);
            util.isInDialog = jest.fn().mockReturnValue(true);
            const result = thread.isOnHighlight({});
            expect(result).toBeTruthy();
        });

        it('should return false if mouse event is neither over the highlight or the dialog', () => {
            thread.isInHighlight = jest.fn().mockReturnValue(false);
            util.isInDialog = jest.fn().mockReturnValue(false);
            const result = thread.isOnHighlight({});
            expect(result).toBeFalsy();
        });
    });

    describe('show()', () => {
        beforeEach(() => {
            thread.draw = jest.fn();
            thread.showDialog = jest.fn();
            thread.hideDialog = jest.fn();
        });

        it('should show the dialog if the state is pending', () => {
            thread.state = STATES.pending;
            thread.show();
            expect(thread.showDialog).toBeCalled();
        });

        it('should not show the dialog if the state is inactive and redraw the highlight as not active', () => {
            thread.state = STATES.inactive;
            thread.show();
            expect(thread.hideDialog).toBeCalled();
            expect(thread.draw).toBeCalledWith(HIGHLIGHT_FILL.normal);
        });

        it('should show the dialog if the state is not pending and redraw the highlight as active', () => {
            thread.state = STATES.hover;
            thread.show();
            expect(thread.showDialog).toBeCalled();
            expect(thread.draw).toBeCalledWith(HIGHLIGHT_FILL.active);
        });

        it('should do nothing if state is invalid', () => {
            thread.state = 'invalid';
            thread.show();
            expect(thread.showDialog).not.toBeCalled();
            expect(thread.draw).not.toBeCalled();
        });
    });

    describe('showDialog()', () => {
        it('should set up the dialog if it does not exist', () => {
            thread.dialog = {
                setup: jest.fn(),
                show: jest.fn()
            };

            thread.showDialog();
            expect(thread.dialog.setup).toBeCalledWith(thread.annotations, thread.showComment);
            expect(thread.dialog.show).toBeCalled;
        });
    });

    describe('createDialog()', () => {
        it('should initialize an appropriate dialog', () => {
            thread.createDialog();
            expect(thread.dialog instanceof DocHighlightDialog).toBeTruthy();
        });
    });

    describe('handleDraw()', () => {
        it('should clear the text selection and show the thread', () => {
            const selection = {
                removeAllRanges: jest.fn()
            };
            window.getSelection = jest.fn().mockReturnValue(selection);
            thread.show = jest.fn();

            thread.handleDraw();
            expect(thread.show).toBeCalled();
            expect(thread.state).toEqual(STATES.pending_active);
            expect(selection.removeAllRanges).toBeCalled();
        });
    });

    describe('handleCommentPending()', () => {
        it('should set the thread state to pending active', () => {
            thread.handleCommentPending();
            expect(thread.state).toEqual(STATES.pending_active);
        });
    });

    describe('handleCreate()', () => {
        it('should create a plain highlight and save', () => {
            thread.saveAnnotation = jest.fn();
            thread.handleCreate();
            expect(thread.saveAnnotation).toBeCalledWith(TYPES.highlight, '');
        });

        it('should create a highlight comment and save', () => {
            thread.saveAnnotation = jest.fn();
            thread.dialog = {
                toggleHighlightCommentsReply: jest.fn(),
                removeAllListeners: jest.fn(),
                destroy: jest.fn()
            };
            thread.annotations = [{}, {}, {}];

            thread.handleCreate({ text: 'something' });
            expect(thread.saveAnnotation).toBeCalledWith(TYPES.highlight_comment, 'something');
        });
    });

    describe('handleDelete()', () => {
        beforeEach(() => {
            thread.deleteAnnotation = jest.fn();
            thread.dialog = {
                toggleHighlightDialogs: jest.fn(),
                removeAllListeners: jest.fn(),
                destroy: jest.fn()
            };
            thread.annotations = [{ annotationID: 1 }, { annotationID: 2 }, {}];
        });

        it('should delete the specified annotationID', () => {
            thread.handleDelete({ annotationID: 2 });
            expect(thread.deleteAnnotation).toBeCalledWith(2);
        });

        it('should delete the first annotation in the thread if no annotationID is provided', () => {
            thread.handleDelete();
            expect(thread.deleteAnnotation).toBeCalledWith(1);
        });
    });

    describe('bindCustomListenersOnDialog()', () => {
        it('should bind custom listeners on dialog', () => {
            thread.dialog = {
                addListener: jest.fn()
            };

            thread.bindCustomListenersOnDialog();

            expect(thread.dialog.addListener).toBeCalledWith('annotationdraw', expect.any(Function));
            expect(thread.dialog.addListener).toBeCalledWith('annotationcommentpending', expect.any(Function));
            expect(thread.dialog.addListener).toBeCalledWith('annotationcreate', expect.any(Function));
            expect(thread.dialog.addListener).toBeCalledWith('annotationcancel', expect.any(Function));
            expect(thread.dialog.addListener).toBeCalledWith('annotationdelete', expect.any(Function));
        });
    });

    describe('unbindCustomListenersOnDialog()', () => {
        it('should unbind custom listeners on dialog', () => {
            thread.dialog = {
                removeAllListeners: jest.fn()
            };
            thread.unbindCustomListenersOnDialog();

            expect(thread.dialog.removeAllListeners).toBeCalledWith('annotationdraw');
            expect(thread.dialog.removeAllListeners).toBeCalledWith('annotationcommentpending');
            expect(thread.dialog.removeAllListeners).toBeCalledWith('annotationcreate');
            expect(thread.dialog.removeAllListeners).toBeCalledWith('annotationcancel');
            expect(thread.dialog.removeAllListeners).toBeCalledWith('annotationdelete');
        });
    });

    describe('draw()', () => {
        it('should not draw if no context exists', () => {
            thread.getPageEl = jest.fn();
            docUtil.getContext = jest.fn().mockReturnValue(null);
            util.getScale = jest.fn();

            thread.draw('fill');
            expect(thread.pageEl).toBeUndefined();
            expect(util.getScale).not.toBeCalled();
        });
    });

    describe('isInHighlight()', () => {
        const pageEl = {
            getBoundingClientRect: jest.fn().mockReturnValue({ height: 0, top: 10 })
        };
        let quadPoint = {};

        beforeEach(() => {
            quadPoint = {};
            thread.location.quadPoints = [quadPoint, quadPoint, quadPoint];

            thread.getPageEl = jest.fn().mockReturnValue(pageEl);
            util.getDimensionScale = jest.fn().mockReturnValue(false);
            docUtil.convertPDFSpaceToDOMSpace = jest.fn().mockReturnValue([0, 0, 0, 0, 0, 0, 0, 0]);
        });

        it('should not scale points if there is no dimensionScale', () => {
            thread.isInHighlight({ clientX: 0, clientY: 0 });
            expect(thread.getPageEl).toBeCalled();
            expect(pageEl.getBoundingClientRect).toBeCalled();
            expect(util.getDimensionScale).toBeCalled();
            expect(docUtil.convertPDFSpaceToDOMSpace).toBeCalled();
        });

        it('should scale points if there is a dimensionScale', () => {
            util.getDimensionScale = jest.fn().mockReturnValue(true);

            thread.isInHighlight({ clientX: 0, clientY: 0 });
            expect(thread.getPageEl).toBeCalled();
            expect(pageEl.getBoundingClientRect).toBeCalled();
            expect(util.getDimensionScale).toBeCalled();
            expect(docUtil.convertPDFSpaceToDOMSpace).toBeCalled();
        });

        it('get the quad points and return if the point isInPolyOpt', () => {
            docUtil.isPointInPolyOpt = jest.fn();

            thread.isInHighlight({ clientX: 0, clientY: 0 });
            expect(thread.getPageEl).toBeCalled();
            expect(pageEl.getBoundingClientRect).toBeCalled();
            expect(util.getDimensionScale).toBeCalled();
            expect(docUtil.convertPDFSpaceToDOMSpace).toBeCalled();
            expect(docUtil.isPointInPolyOpt).toBeCalled();
        });
    });

    describe('regenerateBoundary()', () => {
        it('should do nothing if a valid location does not exist', () => {
            thread.location = undefined;
            thread.regenerateBoundary();

            thread.location = {};
            thread.regenerateBoundary();

            expect(thread.minX).toBeUndefined();
            expect(thread.minY).toBeUndefined();
        });

        it('should set the min/max x/y values for thread location', () => {
            thread.location = {
                quadPoints: [[1, 1, 1, 1, 1, 1, 1, 1], [10, 10, 10, 10, 10, 10, 10, 10]]
            };
            thread.regenerateBoundary();
            expect(thread.minX).toEqual(1);
            expect(thread.minY).toEqual(1);
            expect(thread.maxX).toEqual(10);
            expect(thread.maxY).toEqual(10);
        });
    });
});
