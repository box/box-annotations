/* eslint-disable no-unused-expressions */
import CreateAnnotationDialog from '../CreateAnnotationDialog';
import {
    CLASS_MOBILE_CREATE_ANNOTATION_DIALOG,
    CLASS_ANNOTATION_DIALOG,
    CLASS_HIDDEN,
    CREATE_EVENT
} from '../constants';
import CommentBox from '../CommentBox';
import * as util from '../util';

let dialog;
let parentEl;
const localized = {
    highlightToggle: 'highlight toggle',
    highlightComment: 'highlight comment'
};

describe('CreateAnnotationDialog', () => {
    beforeEach(() => {
        parentEl = document.createElement('div');
        parentEl.classList.add('ba-create-dialog-container');
        dialog = new CreateAnnotationDialog(parentEl, {
            isMobile: true,
            localized
        });

        dialog.commentBox = {
            containerEl: document.createElement('div'),
            hide: jest.fn(),
            show: jest.fn(),
            focus: jest.fn(),
            removeListener: jest.fn(),
            destroy: jest.fn(),
            clear: jest.fn()
        };
    });

    afterEach(() => {
        dialog = null;
        parentEl = null;
    });

    describe('contructor()', () => {
        it('should take config falsey value to disable highlights and comments, when passed in', () => {
            expect(dialog.parentEl).not.toBeUndefined();
            expect(dialog.isMobile).toBeTruthy();
            expect(dialog.hasTouch).toBeFalsy();
            expect(dialog.localized).toEqual(localized);
            expect(dialog.isVisible).toBeFalsy();
        });
    });

    describe('setParentEl()', () => {
        it('should assign the new parent reference', () => {
            const newParent = document.createElement('span');
            dialog.setParentEl(newParent);
            expect(dialog.parentEl).not.toStrictEqual(parentEl);
            expect(dialog.parentEl).toStrictEqual(newParent);
        });
    });

    describe('setPosition()', () => {
        beforeEach(() => {
            dialog.updatePosition = jest.fn();
        });

        it('should set the x and y coordinates to the passed in values', () => {
            const x = 5;
            const y = 6;
            dialog.setPosition(x, y);
            expect(dialog.position.x).toEqual(x);
            expect(dialog.position.y).toEqual(y);
        });

        it('should invoke updatePosition()', () => {
            dialog.setPosition(0, 0);
            expect(dialog.updatePosition).toBeCalled();
        });
    });

    describe('show()', () => {
        it('should invoke createElement() if no UI element has been created', () => {
            dialog.createElement = jest.fn();
            dialog.show();
            expect(dialog.createElement).toBeCalled();
        });

        it('should set the parentEl to a new reference, via setParentEl(), if a new one is supplied', () => {
            dialog.setParentEl = jest.fn();
            const newParent = document.createElement('span');
            dialog.show(newParent);
            expect(dialog.setParentEl).toBeCalledWith(newParent);
        });

        it('should invoke setButtonVisibility() to show the highlight buttons', () => {
            dialog.setButtonVisibility = jest.fn();
            dialog.show();
            expect(dialog.setButtonVisibility).toBeCalled();
        });

        it('should remove the hidden class from the UI element', () => {
            dialog.emit = jest.fn();
            dialog.show();
            expect(dialog.containerEl.classList.contains(CLASS_HIDDEN)).toBeFalsy();
            expect(dialog.emit).toBeCalledWith(CREATE_EVENT.init);
        });
    });

    describe('showCommentBox()', () => {
        it('should show and focus comment box', () => {
            dialog.commentBox = {
                show: jest.fn(),
                focus: jest.fn()
            };
            dialog.showCommentBox();
            expect(dialog.commentBox.show).toBeCalled();
            expect(dialog.commentBox.focus).toBeCalled();
        });
    });

    describe('hide()', () => {
        beforeEach(() => {
            util.hideElement = jest.fn();

            dialog.containerEl = document.createElement('div');
            dialog.commentBox = {
                hide: jest.fn(),
                clear: jest.fn()
            };
            dialog.isVisible = true;
        });

        afterEach(() => {
            expect(dialog.isVisible).toBeFalsy();
        });

        it('should do nothing if there is no UI element', () => {
            dialog.containerEl = null;
            dialog.hide();
            expect(dialog.commentBox.hide).not.toBeCalled();
        });

        it('should add the hidden class to the ui element', () => {
            dialog.commentBox = null;
            dialog.hide();
            expect(util.hideElement).toBeCalledWith(dialog.containerEl);
        });

        it('should hide and clear the comment box', () => {
            dialog.commentBox = {
                hide: jest.fn(),
                clear: jest.fn()
            };
            dialog.hide();
            expect(dialog.commentBox.hide).toBeCalled();
            expect(dialog.commentBox.clear).toBeCalled();
        });
    });

    describe('destroy()', () => {
        let commentBox;
        let containerEl;

        beforeEach(() => {
            dialog.hide = jest.fn();

            containerEl = document.createElement('div');
            containerEl.removeEventListener = jest.fn();
            dialog.containerEl = containerEl;

            commentBox = {
                removeListener: jest.fn(),
                destroy: jest.fn()
            };
            dialog.commentBox = commentBox;
        });

        it('should do nothing if no ui has been created', () => {
            dialog.containerEl = null;
            dialog.destroy();
            expect(dialog.hide).not.toBeCalled();
        });

        it('should remove events that are bound to stopPropagation()', () => {
            dialog.isMobile = false;
            dialog.destroy();
            expect(containerEl.removeEventListener).toBeCalledWith('click', expect.any(Function));
            expect(containerEl.removeEventListener).toBeCalledWith('mouseup', expect.any(Function));
            expect(containerEl.removeEventListener).toBeCalledWith('dblclick', expect.any(Function));
        });

        it('should remove event listeners from the comment box', () => {
            dialog.destroy();
            expect(commentBox.removeListener).toBeCalledWith(CommentBox.CommentEvents.post, expect.any(Function));
            expect(commentBox.removeListener).toBeCalledWith(CommentBox.CommentEvents.cancel, expect.any(Function));
        });

        it('should remove the ui element from the dom', () => {
            dialog.destroy();
            expect(commentBox.removeListener).toBeCalled();
        });

        it('should destroy the comment box', () => {
            dialog.destroy();
            expect(commentBox.destroy).toBeCalled();
        });

        it('should remove out all touch events, if touch enabled', () => {
            dialog.hasTouch = true;
            dialog.isMobile = true;

            const eventStub = [
                {
                    stub: containerEl.removeEventListener,
                    args: ['touchend', dialog.stopPropagation]
                }
            ];

            dialog.destroy();

            eventStub.forEach((stub) => {
                expect(stub.stub).toBeCalledWith(...stub.args);
            });
        });
    });

    describe('updatePosition()', () => {
        beforeEach(() => {
            dialog.isMobile = false;
            dialog.containerEl = document.createElement('div');
            dialog.destroy = jest.fn();
        });

        it('should update the top of the ui element', () => {
            const y = 50;
            dialog.position.y = y;
            dialog.updatePosition();
            expect(dialog.containerEl.style.top).toEqual(`${y + 5}px`);
        });

        it('should update the left of the ui element, to center it', () => {
            const width = dialog.containerEl.clientWidth;
            const x = 50;
            dialog.position.x = x;
            dialog.updatePosition();
            expect(dialog.containerEl.style.left).toEqual(`${x - 1 - width / 2}px`);
        });

        it('should do nothing if user is on a mobile device', () => {
            const y = 50;
            dialog.position.y = y;
            dialog.isMobile = true;
            dialog.updatePosition();
            expect(dialog.containerEl.style.top).not.toEqual(`${y + 5}px`);
        });
    });

    describe('onCommentPost()', () => {
        beforeEach(() => {
            dialog.emit = jest.fn();
            dialog.updatePosition = jest.fn();
            dialog.commentBox = {
                blur: jest.fn(),
                clear: jest.fn()
            };
        });

        it('should invoke the "post" event with the string provided', () => {
            const text = 'some text';
            dialog.onCommentPost(text);
            expect(dialog.emit).toBeCalledWith(CREATE_EVENT.post, text);
        });

        it('should invoke clear() on the comment box', () => {
            dialog.onCommentPost('A message');
            expect(dialog.commentBox.clear).toBeCalled();
        });

        it('should invoke blur() on the comment box', () => {
            dialog.onCommentPost('A message');
            expect(dialog.commentBox.blur).toBeCalled();
        });
    });

    describe('onCommentCancel()', () => {
        beforeEach(() => {
            dialog.emit = jest.fn();
            dialog.setButtonVisibility = jest.fn();
            dialog.updatePosition = jest.fn();
            dialog.commentBox = {
                hide: jest.fn(),
                clear: jest.fn()
            };
        });

        it('should hide the comment box', () => {
            dialog.onCommentCancel();
            expect(dialog.commentBox.hide).toBeCalled();
        });

        it('should show the highlight buttons', () => {
            dialog.onCommentCancel();
            expect(dialog.setButtonVisibility).toBeCalledWith(true);
        });

        it('should update the position of the dialog', () => {
            dialog.onCommentCancel();
            expect(dialog.updatePosition).toBeCalled();
        });
    });

    describe('setButtonVisibility()', () => {
        it('should show the buttons if given "true"', () => {
            util.showElement = jest.fn();
            dialog.setButtonVisibility(true);
            expect(util.showElement).toBeCalledWith(dialog.buttonsEl);
        });

        it('should hide the buttons if given "false"', () => {
            util.hideElement = jest.fn();
            dialog.setButtonVisibility(false);
            expect(util.hideElement).toBeCalledWith(dialog.buttonsEl);
        });
    });

    describe('stopPropagation()', () => {
        it('should invoke stopPropagation() on the provided event', () => {
            const event = {
                stopPropagation: jest.fn()
            };
            dialog.stopPropagation(event);
            expect(event.stopPropagation).toBeCalled();
        });
    });

    describe('setupCommentBox', () => {
        it('should create a comment box', () => {
            dialog.commentBox = undefined;
            const box = dialog.setupCommentBox(document.createElement('div'));
            expect(box).not.toBeUndefined();
        });
    });

    describe('createElement()', () => {
        it('should create a div with the proper create highlight class', () => {
            dialog.createElement();
            expect(dialog.containerEl.nodeName).toEqual('DIV');
            expect(dialog.containerEl.classList.contains(CLASS_MOBILE_CREATE_ANNOTATION_DIALOG)).toBeTruthy();
            expect(dialog.containerEl.classList.contains(CLASS_ANNOTATION_DIALOG)).toBeTruthy();
        });

        it('should create a comment box', () => {
            dialog.setupCommentBox = jest.fn().mockReturnValue(dialog.commentBox);
            dialog.createElement();
            expect(dialog.setupCommentBox).toBeCalledWith(dialog.containerEl);
        });
    });
});
