/* eslint-disable no-unused-expressions */
import CreateHighlightDialog from '../CreateHighlightDialog';
import { CREATE_EVENT, TYPES } from '../../constants';
import * as util from '../../util';
import * as docUtil from '../docUtil';

const html = '<div class="ba-create-highlight-dialog-container"></div>';

describe('doc/CreateHighlightDialog', () => {
    let rootElement;
    let dialog;
    let parentEl;

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        parentEl = document.createElement('div');
        parentEl.classList.add('ba-create-dialog-container');
        dialog = new CreateHighlightDialog(parentEl, {
            allowHighlight: true,
            allowComment: true,
        });
        dialog.annotatedElement = rootElement;
        dialog.renderAnnotationPopover = jest.fn();
        dialog.emit = jest.fn();

        util.shouldDisplayMobileUI = jest.fn().mockReturnValue(false);
    });

    afterEach(() => {
        document.body.removeChild(rootElement);
        if (typeof dialog.destroy === 'function') {
            dialog.destroy();
            dialog = null;
        }

        parentEl = null;
    });

    describe('contructor()', () => {
        it('should default to disable highlights and comments if no config passed in', () => {
            const instance = new CreateHighlightDialog(document.createElement('div'));
            expect(instance.allowHighlight).toBeFalsy();
            expect(instance.allowComment).toBeFalsy();
        });

        it('should take config falsey value to disable highlights and comments, when passed in', () => {
            const config = {
                allowHighlight: true,
                allowComment: false,
            };
            const instance = new CreateHighlightDialog(document.createElement('div'), config);
            expect(instance.allowHighlight).toBeTruthy();
            expect(instance.allowComment).toBeFalsy();
        });
    });

    describe('unmountPopover', () => {
        beforeEach(() => {
            dialog.isVisible = true;
            dialog.createPopoverComponent = {};

            dialog.container = {
                querySelectorAll: jest.fn().mockReturnValue([rootElement]),
            };
        });

        it('should do nothing if the popover is not visible', () => {
            dialog.isVisible = false;
            dialog.unmountPopover();
            expect(dialog.createPopoverComponent).not.toBeNull();
        });

        it('should there are no popover layers', () => {
            dialog.container = {
                querySelectorAll: jest.fn().mockReturnValue([]),
            };
            dialog.unmountPopover();
            expect(dialog.createPopoverComponent).not.toBeNull();
        });

        it('should unmount any visible create highlight popovers', () => {
            dialog.unmountPopover();
            expect(dialog.createPopoverComponent).toBeNull();
        });
    });

    describe('show()', () => {
        const selection = { anchorNode: {} };
        const pageInfo = { page: 1, pageEl: {} };

        beforeEach(() => {
            dialog.pageInfo = null;
            dialog.setPosition = jest.fn();
            dialog.renderAnnotationPopover = jest.fn();
            util.getPageInfo = jest.fn().mockReturnValue(pageInfo);
        });

        it('should do nothing if no selection is passed in', () => {
            dialog.show();
            expect(dialog.renderAnnotationPopover).not.toBeCalled();
        });

        it('should set the position and render the popover on desktop', () => {
            dialog.show(selection);
            expect(dialog.pageInfo).toEqual(pageInfo);
            expect(dialog.setPosition).toBeCalled();
            expect(dialog.renderAnnotationPopover).toBeCalled();
        });

        it('should only render the popover on mobile', () => {
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(true);
            dialog.show(selection);
            expect(dialog.pageInfo).toEqual(pageInfo);
            expect(dialog.setPosition).not.toBeCalled();
            expect(dialog.renderAnnotationPopover).toBeCalled();
        });
    });

    describe('setPosition()', () => {
        const selection = {
            getRangeAt: jest.fn(),
            rangeCount: 1,
        };

        const pageEl = {
            getBoundingClientRect: jest.fn().mockReturnValue({
                left: 1,
                top: 2,
            }),
        };

        beforeEach(() => {
            util.getPageInfo = jest.fn();
            dialog.updatePosition = jest.fn();
            docUtil.getDialogCoordsFromRange = jest.fn();
        });

        it('should do nothing if the selection is invalid', () => {
            selection.rangeCount = undefined;
            dialog.setPosition(selection);
            expect(selection.getRangeAt).not.toBeCalled();
        });

        it('should do nothing if no page element is calculated from the selection', () => {
            util.getPageInfo = jest.fn().mockReturnValue({});
            dialog.setPosition(selection);
            expect(pageEl.getBoundingClientRect).not.toBeCalled();
        });
    });

    describe('updatePosition()', () => {
        beforeEach(() => {
            util.showElement = jest.fn();
            dialog.pageInfo = { page: 1, pageEl: document.createElement('div') };
            util.findElement = jest.fn().mockReturnValue(rootElement);
        });

        it('should do nothing on mobile devices', () => {
            util.shouldDisplayMobileUI = jest.fn().mockReturnValue(true);
            dialog.updatePosition();
            expect(util.findElement).not.toBeCalled();
        });

        it('should update the positioning of the popover element', () => {
            const x = 50;
            util.repositionCaret = jest.fn().mockReturnValue(x);
            dialog.updatePosition();
            expect(util.findElement).toBeCalled();
        });
    });

    describe('onCreate()', () => {
        it('should invoke the "plain" highlight event', () => {
            dialog.onCreate(TYPES.highlight);
            expect(dialog.emit).toBeCalledWith(CREATE_EVENT.plain);
        });
    });

    describe('onCommentClick()', () => {
        it('should create a plain highlight and render the popover', () => {
            dialog.onCommentClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
            expect(dialog.emit).toBeCalledWith(CREATE_EVENT.comment);
            expect(dialog.renderAnnotationPopover).toBeCalled();
        });
    });
});
