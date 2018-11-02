/* eslint-disable no-unused-expressions */
import DocHighlightThread from '../DocHighlightThread';
import * as util from '../../util';
import * as docUtil from '../docUtil';

import { STATES, TYPES, HIGHLIGHT_FILL, THREAD_EVENT } from '../../constants';

let thread;

const html = `<div class="annotated-element">
  <div data-page-number="1"></div>
  <div data-page-number="2"></div>
</div>`;

describe('doc/DocHighlightThread', () => {
    let rootElement;

    const api = {
        user: {},
        create: jest.fn().mockResolvedValue({})
    };

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        thread = new DocHighlightThread({
            annotatedElement: rootElement,
            annotations: [],
            api,
            fileVersionId: 1,
            location: { page: 1, quadPoints: [] },
            threadID: 2,
            type: 'highlight',
            permissions: {
                can_annotate: true,
                can_view_annotations_all: true
            },
            minX: 1,
            maxX: 10,
            minY: 1,
            maxY: 10
        });
        thread.renderAnnotationPopover = jest.fn();
        thread.unmountPopover = jest.fn();

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

    describe('destroy()', () => {
        it('should destroy the thread', () => {
            thread.emit = jest.fn();

            thread.destroy();
            expect(thread.element).toBeUndefined();
            expect(thread.emit).toBeCalledWith(THREAD_EVENT.render, { page: thread.location.page });
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
            thread.draw = jest.fn();
            thread.reset();
            expect(thread.draw).toBeCalledWith(HIGHLIGHT_FILL.normal);
            expect(thread.state).toEqual(STATES.inactive);
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
            thread.state = STATES.active;
            thread.type = TYPES.highlight_comment;

            const isHighlightPending = thread.onClick({}, true);

            expect(isHighlightPending).toBeFalsy();
            expect(thread.state).toEqual(STATES.inactive);
        });

        it('should set annotation to active if mouse is activeing over highlight or dialog', () => {
            thread.state = STATES.pending;
            thread.type = TYPES.highlight_comment;

            thread.isOnHighlight = jest.fn().mockReturnValue(true);
            thread.reset = jest.fn();
            thread.show = jest.fn();

            const isHighlightPending = thread.onClick({}, false);

            expect(isHighlightPending).toBeTruthy();
            expect(thread.reset).not.toBeCalled();
            expect(thread.state).toEqual(STATES.active);
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
            thread.renderAnnotationPopover = jest.fn();
            thread.unmountPopover = jest.fn();
        });

        it('should render the popover if the state is pending', () => {
            thread.state = STATES.pending;
            thread.show();
            expect(thread.renderAnnotationPopover).toBeCalled();
        });

        it('should not render the popover if the state is inactive and redraw the highlight as not active', () => {
            thread.state = STATES.inactive;
            thread.show();
            expect(thread.unmountPopover).toBeCalled();
            expect(thread.draw).toBeCalledWith(HIGHLIGHT_FILL.normal);
        });

        it('should render the popover if the state is not pending and redraw the highlight as active', () => {
            thread.state = STATES.active;
            thread.show();
            expect(thread.renderAnnotationPopover).toBeCalled();
            expect(thread.draw).toBeCalledWith(HIGHLIGHT_FILL.active);
        });

        it('should do nothing if state is invalid', () => {
            thread.state = 'invalid';
            thread.show();
            expect(thread.renderAnnotationPopover).not.toBeCalled();
            expect(thread.draw).not.toBeCalled();
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
            expect(thread.state).toEqual(STATES.pending);
            expect(selection.removeAllRanges).toBeCalled();
        });
    });

    describe('handleCommentPending()', () => {
        it('should set the thread state to pending active', () => {
            thread.handleCommentPending();
            expect(thread.state).toEqual(STATES.pending);
        });
    });

    describe('handleCreate()', () => {
        it('should create a plain highlight and save', () => {
            thread.save = jest.fn();
            thread.handleCreate();
            expect(thread.save).toBeCalledWith(TYPES.highlight, '');
        });

        it('should create a highlight comment and save', () => {
            thread.save = jest.fn();
            thread.comments = [{}, {}, {}];

            thread.handleCreate('something');
            expect(thread.save).toBeCalledWith(TYPES.highlight_comment, 'something');
        });
    });

    describe('handleDelete()', () => {
        beforeEach(() => {
            thread.delete = jest.fn();
            thread.comments = [{ id: 1 }, { id: 2 }, {}];
        });

        it('should delete the specified id', () => {
            thread.handleDelete({ id: 2 });
            expect(thread.delete).toBeCalledWith({ id: 2 });
        });

        it('should delete the first annotation in the thread if no id is provided', () => {
            thread.comments = [];
            thread.id = 1;
            thread.handleDelete();
            expect(thread.delete).toBeCalledWith({ id: 1 });
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

            expect(thread.minX).toEqual(Infinity);
            expect(thread.minY).toEqual(Infinity);
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
