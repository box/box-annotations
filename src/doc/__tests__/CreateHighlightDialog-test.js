/* eslint-disable no-unused-expressions */
import CreateHighlightDialog from '../CreateHighlightDialog';
import {
    SELECTOR_ADD_HIGHLIGHT_BTN,
    SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN,
    SELECTOR_ANNOTATION_CARET,
    CREATE_EVENT
} from '../../constants';
import CommentBox from '../../CommentBox';
import * as util from '../../util';
import * as docUtil from '../docUtil';

const CLASS_CREATE_DIALOG = 'ba-create-annotation-dialog';
const html = '<div class="ba-create-highlight-dialog-container"></div>';

describe('doc/CreateHighlightDialog', () => {
    let rootElement;
    let dialog;
    let parentEl;
    const localized = {
        highlightToggle: 'highlight toggle',
        highlightComment: 'highlight comment'
    };

    beforeEach(() => {
        rootElement = document.createElement('div');
        rootElement.innerHTML = html;
        document.body.appendChild(rootElement);

        parentEl = document.createElement('div');
        parentEl.classList.add('ba-create-dialog-container');
        dialog = new CreateHighlightDialog(parentEl, {
            allowHighlight: true,
            allowComment: true,
            localized
        });
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
                localized
            };
            const instance = new CreateHighlightDialog(document.createElement('div'), config);
            expect(instance.allowHighlight).toBeTruthy();
            expect(instance.allowComment).toBeFalsy();
        });
    });

    describe('show()', () => {
        beforeEach(() => {
            dialog.setPosition = jest.fn();
            dialog.parentEl = {
                querySelector: jest.fn(),
                appendChild: jest.fn()
            };
        });

        it('should do nothing if no selection is passed in', () => {
            util.getPageInfo = jest.fn();
            dialog.show({});
            expect(dialog.parentEl.appendChild).not.toBeCalled();
            expect(util.getPageInfo).not.toBeCalled();
        });

        it('should do nothing if no page element is calculated from the selection', () => {
            util.getPageInfo = jest.fn().mockReturnValue({});
            dialog.show({}, {});
            expect(dialog.parentEl.appendChild).not.toBeCalled();
            expect(util.getPageInfo).toBeCalled();
        });

        it('should set the parentEl to a new reference, via setParentEl(), if a new one is supplied', () => {
            const newParent = document.createElement('span');
            util.getPageInfo = jest.fn().mockReturnValue({ pageEl: dialog.parentEl });

            dialog.show(newParent, {});
            expect(dialog.parentEl.querySelector).toBeCalled();
            expect(dialog.parentEl.appendChild).toBeCalled();
        });
    });

    describe('setPosition()', () => {
        const selection = {
            getRangeAt: jest.fn(),
            rangeCount: 1
        };

        const pageEl = {
            getBoundingClientRect: jest.fn().mockReturnValue({
                left: 1,
                top: 2
            })
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

    describe('destroy()', () => {
        beforeEach(() => {
            dialog.containerEl = {
                classList: { add: jest.fn() },
                remove: jest.fn(),
                removeEventListener: jest.fn()
            };
        });

        it('should remove click event listener from the highlight button', () => {
            dialog.highlightCreateEl = {
                removeEventListener: jest.fn()
            };
            dialog.destroy();
            expect(dialog.highlightCreateEl.removeEventListener).toHaveBeenCalledTimes(3);
        });

        it('should remove click event listener from the comment button', () => {
            dialog.commentCreateEl = {
                removeEventListener: jest.fn()
            };
            dialog.destroy();
            expect(dialog.commentCreateEl.removeEventListener).toHaveBeenCalledTimes(3);
        });

        it('should remove out all touch events, if touch enabled', () => {
            dialog.hasTouch = true;
            dialog.isMobile = true;

            dialog.highlightCreateEl = {
                removeEventListener: jest.fn()
            };
            dialog.commentCreateEl = {
                removeEventListener: jest.fn()
            };

            const eventStubs = [
                {
                    stub: dialog.highlightCreateEl.removeEventListener,
                    args: ['touchstart', dialog.stopPropagation]
                },
                {
                    stub: dialog.highlightCreateEl.removeEventListener,
                    args: ['touchend', dialog.onHighlightClick]
                },
                {
                    stub: dialog.commentCreateEl.removeEventListener,
                    args: ['touchstart', dialog.stopPropagation]
                },
                {
                    stub: dialog.commentCreateEl.removeEventListener,
                    args: ['touchend', dialog.onCommentClick]
                },
                {
                    stub: dialog.containerEl.removeEventListener,
                    args: ['touchend', dialog.stopPropagation]
                }
            ];

            dialog.destroy();

            eventStubs.forEach((stub) => {
                expect(stub.stub).toBeCalledWith(...stub.args);
            });
        });
    });

    describe('updatePosition()', () => {
        beforeEach(() => {
            util.showElement = jest.fn();
            dialog.isMobile = false;
        });

        it('should do nothing on mobile devices', () => {
            dialog.isMobile = true;
            dialog.updatePosition();
            expect(util.showElement).not.toBeCalled();
        });

        it('should update the top of the ui element', () => {
            const y = 50;
            dialog.position.y = y;
            dialog.updatePosition();
            expect(dialog.containerEl.style.top).toEqual(`${y + 5}px`);
            expect(util.showElement).toBeCalled();
        });

        it('should update the left of the ui element, to center it', () => {
            const x = 50;
            dialog.position.x = x;
            util.repositionCaret = jest.fn().mockReturnValue(x);
            dialog.updatePosition();
            expect(dialog.containerEl.style.left).toEqual(`${x}px`);
            expect(util.showElement).toBeCalled();
        });
    });

    describe('onHighlightClick()', () => {
        it('should invoke the "plain" highlight event', () => {
            dialog.emit = jest.fn();
            dialog.onHighlightClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
            expect(dialog.emit).toBeCalledWith(CREATE_EVENT.plain);
        });
    });

    describe('onCommentClick()', () => {
        beforeEach(() => {
            dialog.show();

            dialog.commentBox = {
                show: jest.fn(),
                hide: jest.fn(),
                clear: jest.fn(),
                focus: jest.fn(),
                removeListener: jest.fn(),
                destroy: jest.fn()
            };
        });

        it('should invoke the "comment" highlight event', () => {
            dialog.emit = jest.fn();
            dialog.onCommentClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
            expect(dialog.emit).toBeCalledWith(CREATE_EVENT.comment);
        });

        it('should show the comment box', () => {
            dialog.onCommentClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
            expect(dialog.commentBox.show).toBeCalled();
        });

        it('should focus on the comment box', () => {
            dialog.onCommentClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
            expect(dialog.commentBox.focus).toBeCalled();
        });

        it('should hide the highlight buttons', () => {
            dialog.setButtonVisibility = jest.fn();
            dialog.onCommentClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
            expect(dialog.setButtonVisibility).toBeCalled();
        });

        it('should invoke update position', () => {
            dialog.updatePosition = jest.fn();
            dialog.onCommentClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
            expect(dialog.updatePosition).toBeCalled();
        });
    });

    describe('createElement()', () => {
        it('should create a div with the proper create highlight class', () => {
            dialog.createElement();
            expect(dialog.containerEl.nodeName).toEqual('DIV');
            expect(dialog.containerEl.classList.contains(CLASS_CREATE_DIALOG)).toBeTruthy();
        });

        it('should make a reference to the highlight button', () => {
            dialog.createElement();
            expect(dialog.highlightCreateEl).not.toBeNull();
            expect(dialog.highlightCreateEl).not.toBeUndefined();
        });

        it('should make a reference to the comment button', () => {
            dialog.createElement();
            expect(dialog.commentCreateEl).not.toBeNull();
            expect(dialog.commentCreateEl).not.toBeUndefined();
        });

        it('should create a comment box', () => {
            dialog.createElement();
            expect(dialog.commentBox).toBeInstanceOf(CommentBox);
        });

        it('should not create the caret if on a mobile device', () => {
            dialog.isMobile = true;
            dialog.createElement();

            expect(dialog.containerEl.querySelector(SELECTOR_ANNOTATION_CARET)).toBeNull();
        });

        it('should not create a highlight button if highlights are disabled', () => {
            dialog.allowHighlight = false;
            dialog.createElement();

            expect(dialog.containerEl.querySelector(SELECTOR_ADD_HIGHLIGHT_BTN)).toBeNull();
        });

        it('should not create a comment box or button if comments are disabled', () => {
            dialog.allowComment = false;
            dialog.commentBox = undefined;
            dialog.createElement();

            expect(dialog.containerEl.querySelector(SELECTOR_ADD_HIGHLIGHT_COMMENT_BTN)).toBeNull();
            expect(dialog.commentBox).not.toBeInstanceOf(CommentBox);
        });
    });
});
